
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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#E84142',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#2C2C2C',
					foreground: '#FFFFFF'
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
				avalanche: {
					red: '#E84142',
					white: '#FFFFFF',
					dark: '#2C2C2C',
					gray: '#F5F5F5'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'rocket-launch': {
					'0%': {
						transform: 'translateX(-50%) translateY(100px) scale(1)',
						opacity: '1'
					},
					'20%': {
						transform: 'translateX(-50%) translateY(-200px) scale(1.1)',
						opacity: '1'
					},
					'50%': {
						transform: 'translateX(-50%) translateY(-600px) scale(1.3) rotate(5deg)',
						opacity: '1'
					},
					'80%': {
						transform: 'translateX(-50%) translateY(-1200px) scale(1.5) rotate(-5deg)',
						opacity: '0.8'
					},
					'100%': {
						transform: 'translateX(-50%) translateY(-2000px) scale(2) rotate(0deg)',
						opacity: '0'
					}
				},
				'flame': {
					'0%, 100%': {
						transform: 'scaleY(1) scaleX(1)',
						opacity: '0.9'
					},
					'50%': {
						transform: 'scaleY(1.3) scaleX(0.8)',
						opacity: '1'
					}
				},
				'particle': {
					'0%': {
						transform: 'translateY(0) scale(1)',
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(50px) scale(0.3)',
						opacity: '0'
					}
				},
				'confetti': {
					'0%': {
						transform: 'translateY(0) rotate(0deg)',
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(300px) rotate(720deg)',
						opacity: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'rocket-launch': 'rocket-launch 4s ease-out forwards',
				'flame': 'flame 0.2s ease-in-out infinite',
				'particle': 'particle 0.8s ease-out infinite',
				'confetti': 'confetti 3s ease-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
