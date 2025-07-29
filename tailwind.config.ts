import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// GalaxIA Design System Colors
				'galaxia': {
					'base': 'hsl(var(--bg-base))',
					'surface': 'hsl(var(--surface-1))',
					'grad-a': 'hsl(var(--grad-a))',
					'grad-b': 'hsl(var(--grad-b))',
					'grad-c': 'hsl(var(--grad-c))',
					'neon': 'hsl(var(--accent-neon))',
					'magenta': 'hsl(var(--accent-magenta))',
					'future-dusk': 'hsl(var(--future-dusk))',
					'text-primary': 'hsl(var(--text-primary))',
					'text-muted': 'hsl(var(--text-muted))',
					'success': 'hsl(var(--success))',
					'warning': 'hsl(var(--warning))',
					'error': 'hsl(var(--error))',
				},
				// Legacy compatibility
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-future-dusk': 'var(--gradient-future-dusk)',
				'galaxia-gradient': 'linear-gradient(135deg, hsl(var(--grad-a)) 0%, hsl(var(--grad-b)) 50%, hsl(var(--grad-c)) 100%)',
				'galaxia-hero': 'var(--gradient-hero)',
				'galaxia-card': 'var(--gradient-card)',
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)',
				'cosmic': 'var(--shadow-cosmic)',
				'galaxia-glow': '0 0 40px hsl(var(--accent-neon) / 0.2)',
				'galaxia-elegant': '0 10px 30px -10px hsl(var(--grad-a) / 0.15)',
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'cosmic': 'var(--transition-cosmic)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'slow-zoom': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' }
				},
				'cosmic-float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'50%': { transform: 'translateY(-10px) rotate(1deg)' }
				},
				'star-twinkle': {
					'0%, 100%': { opacity: '0.1' },
					'50%': { opacity: '0.3' }
				},
				'gradient-shift': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'cosmic-pulse': {
					'0%, 100%': { 
						transform: 'scale(1)',
						opacity: '1'
					},
					'50%': { 
						transform: 'scale(1.05)',
						opacity: '0.8'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slow-zoom': 'slow-zoom 20s ease-in-out infinite',
				'cosmic-float': 'cosmic-float 6s ease-in-out infinite',
				'star-twinkle': 'star-twinkle 3s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 5s ease-in-out infinite',
				'cosmic-pulse': 'cosmic-pulse 4s ease-in-out infinite'
			},
			fontFamily: {
				'galaxia': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				'cosmic': ['Space Grotesk', 'Inter', 'sans-serif'],
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
