import express from "express";
import { Request, Response } from "express";
import { db } from "../db/index.js";
import { freelancerProfiles, servicePackages } from "../db/schema.js";
import { eq, and, asc, desc, like, or, sql } from 'drizzle-orm';
import { requireAuth } from "./auth.js";

const router = express.Router();

// Update freelancer coverage areas
router.put("/areas", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { coverageType, areas, radius, centerCoordinates, availabilityHours } = req.body;

    // Validate coverage type
    if (!['nationwide', 'statewide', 'citywide', 'radius', 'specific_areas'].includes(coverageType)) {
      return res.status(400).json({ error: "Invalid coverage type" });
    }

    // Validate required fields based on coverage type
    if (coverageType === 'radius') {
      if (!centerCoordinates || !radius) {
        return res.status(400).json({ 
          error: "Center coordinates and radius are required for radius coverage" 
        });
      }
      if (!centerCoordinates.lat || !centerCoordinates.lng) {
        return res.status(400).json({ 
          error: "Valid latitude and longitude are required" 
        });
      }
    }

    if (coverageType === 'specific_areas' && (!areas || areas.length === 0)) {
      return res.status(400).json({ 
        error: "At least one area must be specified for specific areas coverage" 
      });
    }

    // Validate availability hours format
    if (availabilityHours) {
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const day of validDays) {
        if (availabilityHours[day]) {
          const { start, end, available } = availabilityHours[day];
          if (available && (!start || !end)) {
            return res.status(400).json({ 
              error: `Start and end time required for ${day}` 
            });
          }
        }
      }
    }

    // Build coverage areas object
    const coverageAreas: any = {
      type: coverageType,
      updatedAt: new Date().toISOString()
    };

    switch (coverageType) {
      case 'radius':
        coverageAreas.center = centerCoordinates;
        coverageAreas.radius = radius;
        break;
      case 'specific_areas':
        coverageAreas.areas = areas;
        break;
      case 'statewide':
        coverageAreas.states = areas;
        break;
      case 'citywide':
        coverageAreas.cities = areas;
        break;
    }

    // Update freelancer profile
    const [updatedProfile] = await db
      .update(freelancerProfiles)
      .set({
        coverageAreas,
        availabilityHours: availabilityHours || null
      })
      .where(eq(freelancerProfiles.userId, userId))
      .returning();

    if (!updatedProfile) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    res.json({
      message: "Coverage areas updated successfully",
      coverage: {
        type: coverageType,
        areas: coverageAreas,
        availabilityHours
      }
    });

  } catch (error: any) {
    console.error("Update coverage areas error:", error);
    res.status(500).json({ error: "Failed to update coverage areas" });
  }
});

// Get freelancer coverage areas
router.get("/areas", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [profile] = await db
      .select({
        coverageAreas: freelancerProfiles.coverageAreas,
        availabilityHours: freelancerProfiles.availabilityHours,
        location: freelancerProfiles.location
      })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    res.json({
      coverage: {
        areas: profile.coverageAreas,
        availabilityHours: profile.availabilityHours,
        baseLocation: profile.location
      }
    });

  } catch (error: any) {
    console.error("Get coverage areas error:", error);
    res.status(500).json({ error: "Failed to fetch coverage areas" });
  }
});

// Search freelancers by location/coverage
router.post("/search", async (req: Request, res: Response) => {
  try {
    const { 
      location, 
      coordinates, 
      serviceCategory, 
      maxDistance = 50,
      includeRemote = true 
    } = req.body;

    if (!location && !coordinates) {
      return res.status(400).json({ 
        error: "Either location or coordinates must be provided" 
      });
    }

    // Build the base query
    let query = db
      .select({
        id: freelancerProfiles.id,
        userId: freelancerProfiles.userId,
        title: freelancerProfiles.title,
        description: freelancerProfiles.description,
        location: freelancerProfiles.location,
        coverageAreas: freelancerProfiles.coverageAreas,
        availabilityHours: freelancerProfiles.availabilityHours,
        hourlyRate: freelancerProfiles.hourlyRate,
        averageRating: freelancerProfiles.averageRating,
        completedProjects: freelancerProfiles.completedProjects,
        responseTime: freelancerProfiles.responseTime,
        isVerified: freelancerProfiles.isVerified,
        isPro: freelancerProfiles.isPro
      })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.isVerified, true));

    const freelancers = await query;

    // Filter freelancers based on coverage areas
    const matchingFreelancers = freelancers.filter(freelancer => {
      const coverage = freelancer.coverageAreas as any;
      
      if (!coverage || !coverage.type) {
        return false; // No coverage defined
      }

      switch (coverage.type) {
        case 'nationwide':
          return true; // Available everywhere
          
        case 'statewide':
          if (!coverage.states || !location) return false;
          return coverage.states.some((state: string) => 
            location.toLowerCase().includes(state.toLowerCase())
          );
          
        case 'citywide':
          if (!coverage.cities || !location) return false;
          return coverage.cities.some((city: string) => 
            location.toLowerCase().includes(city.toLowerCase())
          );
          
        case 'specific_areas':
          if (!coverage.areas || !location) return false;
          return coverage.areas.some((area: string) => 
            location.toLowerCase().includes(area.toLowerCase()) ||
            area.toLowerCase().includes(location.toLowerCase())
          );
          
        case 'radius':
          if (!coverage.center || !coverage.radius || !coordinates) return false;
          
          // Calculate distance using Haversine formula
          const R = 6371; // Earth's radius in kilometers
          const dLat = (coordinates.lat - coverage.center.lat) * Math.PI / 180;
          const dLon = (coordinates.lng - coverage.center.lng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coverage.center.lat * Math.PI / 180) * Math.cos(coordinates.lat * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          return distance <= Math.min(coverage.radius, maxDistance);
          
        default:
          return false;
      }
    });

    // Sort by proximity (for radius coverage) and rating
    const sortedFreelancers = matchingFreelancers.sort((a, b) => {
      // First, prioritize by verification and pro status
      if (a.isPro && !b.isPro) return -1;
      if (!a.isPro && b.isPro) return 1;
      
      // Then by average rating
      const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
      if (Math.abs(ratingDiff) > 0.1) return ratingDiff;
      
      // Finally by completed projects
      return (b.completedProjects || 0) - (a.completedProjects || 0);
    });

    res.json({
      freelancers: sortedFreelancers,
      searchParams: {
        location,
        coordinates,
        maxDistance,
        resultsCount: sortedFreelancers.length
      }
    });

  } catch (error: any) {
    console.error("Search freelancers by coverage error:", error);
    res.status(500).json({ error: "Failed to search freelancers" });
  }
});

// Get available time slots for a freelancer
router.get("/:freelancerId/availability", async (req: Request, res: Response) => {
  try {
    const { freelancerId } = req.params;
    const { date, timezone = 'America/Sao_Paulo' } = req.query;

    const [freelancer] = await db
      .select({
        availabilityHours: freelancerProfiles.availabilityHours,
        responseTime: freelancerProfiles.responseTime
      })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.id, freelancerId))
      .limit(1);

    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    const availability = freelancer.availabilityHours as any;
    if (!availability) {
      return res.json({
        available: false,
        message: "Availability hours not configured"
      });
    }

    // Get day of week for the requested date
    const targetDate = date ? new Date(date as string) : new Date();
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    const dayAvailability = availability[dayOfWeek];
    
    if (!dayAvailability || !dayAvailability.available) {
      return res.json({
        available: false,
        day: dayOfWeek,
        message: "Not available on this day"
      });
    }

    // Generate time slots (example: 1-hour slots)
    const slots = [];
    const startTime = dayAvailability.start;
    const endTime = dayAvailability.end;
    
    // Convert time strings to minutes for easier calculation
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    for (let minutes = startMinutes; minutes < endMinutes; minutes += 60) {
      slots.push({
        time: minutesToTime(minutes),
        available: true // In a real app, check against existing bookings
      });
    }

    res.json({
      available: true,
      day: dayOfWeek,
      responseTime: freelancer.responseTime,
      timeSlots: slots,
      timezone
    });

  } catch (error: any) {
    console.error("Get availability error:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// Utility functions
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Update service-specific coverage areas
router.put("/services/:serviceId/areas", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { serviceId } = req.params;
    const { serviceAreas } = req.body;

    // Verify service ownership
    const [service] = await db
      .select({ freelancerId: servicePackages.freelancerId })
      .from(servicePackages)
      .leftJoin(freelancerProfiles, eq(servicePackages.freelancerId, freelancerProfiles.id))
      .where(
        and(
          eq(servicePackages.id, serviceId),
          eq(freelancerProfiles.userId, userId)
        )
      )
      .limit(1);

    if (!service) {
      return res.status(404).json({ error: "Service not found or access denied" });
    }

    // Update service areas
    const [updatedService] = await db
      .update(servicePackages)
      .set({ serviceAreas })
      .where(eq(servicePackages.id, serviceId))
      .returning();

    res.json({
      message: "Service coverage areas updated successfully",
      serviceId,
      serviceAreas
    });

  } catch (error: any) {
    console.error("Update service coverage error:", error);
    res.status(500).json({ error: "Failed to update service coverage" });
  }
});

export { router as coverageRouter };