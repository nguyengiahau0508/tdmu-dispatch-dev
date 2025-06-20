
import { definePreset } from "@primeng/themes";
import Aura from '@primeng/themes/aura';

export const Tdmu = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#E3EAF7',
      100: '#BACBEA',
      200: '#90AADB',
      300: '#6688CC',
      400: '#3D67BD',
      500: '#1345AE',
      600: '#0F3A97',
      700: '#0C2F7F',
      800: '#092467',
      900: '#061950',
      950: '#031038'
    },
    accent: {
      50: '#FFF3E0',
      100: '#FFE0B2',
      200: '#FFCC80',
      300: '#FFB74D',
      400: '#FFA726',
      500: '#FF9800',
      600: '#FB8C00',
      700: '#F57C00',
      800: '#EF6C00',
      900: '#E65100',
      950: '#a84300'
    },
    colorScheme: {
      light: {
        primary: {
          color: '#0D47A1',
          inverseColor: '#FFFFFF',
          hoverColor: '#1565C0',
          activeColor: '#0D47A1'
        },
        surface: {
          0: '#FFFFFF',
          50: '#F5F5F5',
          100: '#ECEFF1',
          200: '#E0E0E0',
          300: '#D6D6D6',
          400: '#B0B0B0',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121'
        },
        content: {
          background: '#FFFFFF',
          hoverBackground: '#F5F5F5',
          border: '#E0E0E0',
          color: '#212121',
          hoverColor: '#212121',
          mutedColor: '#757575'
        },
        highlight: {
          background: '#0D47A1',
          focusBackground: '#1565C0',
          color: '#FFFFFF',
          focusColor: '#FFFFFF'
        },
        focus: {
          borderColor: '#0D47A1',
          shadow: '0 0 0 0.2rem rgba(13, 71, 161, 0.5)'
        }
      },
      dark: {
        primary: {
          color: '#0D47A1',
          inverseColor: '#FFFFFF',
          hoverColor: '#1565C0',
          activeColor: '#0D47A1'
        },
        surface: {
          0: '#212121',
          50: '#2B2B2B',
          100: '#2B2B2B',
          200: '#424242',
          300: '#4E4E4E',
          400: '#616161',
          500: '#757575',
          600: '#9E9E9E',
          700: '#B0B0B0',
          800: '#D6D6D6',
          900: '#E0E0E0'
        },
        content: {
          background: '#212121',
          hoverBackground: '#2B2B2B',
          border: '#424242',
          color: '#E0E0E0',
          hoverColor: '#E0E0E0',
          mutedColor: '#B0B0B0'
        },
        highlight: {
          background: 'rgba(13, 71, 161, 0.16)',
          focusBackground: 'rgba(13, 71, 161, 0.24)',
          color: '#E0E0E0',
          focusColor: '#E0E0E0'
        },
        focus: {
          borderColor: '#0D47A1',
          shadow: '0 0 0 0.2rem rgba(13, 71, 161, 0.5)'
        }
      }
    }
  },
  components: {
    button: {
      root: {
        background: '#0D47A1',
        color: '#FFFFFF',
        border: '1px solid #0D47A1',
        borderRadius: '6px',
        shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        hoverBackground: '#1565C0',
        activeBackground: '#0D47A1',
        dark: {
          background: '#0D47A1',
          color: '#FFFFFF',
          border: '1px solid #0D47A1',
          shadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          hoverBackground: '#1565C0',
          activeBackground: '#0D47A1'
        }
      }
    },
    inputtext: {
      root: {
        borderRadius: '6px',
        border: '1px solid {content.border}',
        background: '{content.background}',
        color: '{content.color}',
        disabledBackground: '{surface.200}'
      }
    },
    panel: {
      root: {
        background: '{surface.0}',
        border: '1px solid {content.border}',
        borderRadius: '6px',
        shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        dark: {
          shadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }
      }
    },
    card: {
      root: {
        background: '{surface.0}',
        border: '1px solid {content.border}',
        borderRadius: '6px',
        shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        dark: {
          shadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }
      }
    },
    menu: {
      root: {
        background: '{surface.0}',
        border: '1px solid {content.border}',
        borderRadius: '6px',
        shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        dark: {
          shadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }
      }
    }
  }
});

