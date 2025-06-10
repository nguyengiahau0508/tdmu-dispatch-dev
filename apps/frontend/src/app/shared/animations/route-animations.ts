
import { animate, query, style, transition, trigger, group } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    // Set position relative cho container
    query(':enter, :leave', [
      style({
        position: 'absolute',
        width: '100%',
        top: 0,
        left: 0,
      }),
    ], { optional: true }),

    // Set trạng thái ban đầu cho enter + leave
    query(':enter', [
      style({
        transform: 'translateX(100%)',
        opacity: 0,
      }),
    ], { optional: true }),

    // Animate song song enter + leave
    group([
      query(':leave', [
        animate('400ms ease', style({
          transform: 'translateX(-100%)',
          opacity: 0,
        })),
      ], { optional: true }),

      query(':enter', [
        animate('400ms ease', style({
          transform: 'translateX(0%)',
          opacity: 1,
        })),
      ], { optional: true }),
    ]),
  ]),
]);

