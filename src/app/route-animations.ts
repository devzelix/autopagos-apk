import { trigger, transition, style, query, animate, group } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  
  // 1. CAROUSEL HORIZONTAL: Welcome <-> Idle (Publicidad)
  transition('WelcomePage <=> IdlePage', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ transform: 'translateX(100%)' })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('800ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(-100%)' }))
      ], { optional: true }),
      query(':enter', [
        animate('800ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(0)' }))
      ], { optional: true })
    ])
  ]),

  // 2. VERTICAL PUSH UP: (Welcome o Idle) -> PayPage
  transition('* => PayPage', [
    style({ position: 'relative', overflow: 'hidden' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        'display': 'flex',
        'justify-content': 'center',
        'align-items': 'flex-start'
      })
    ], { optional: true }),
    query(':enter', [
      style({ transform: 'translateY(100%)', zIndex: 2 })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(-100%)' }))
      ], { optional: true }),
      query(':enter', [
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(0)' }))
      ], { optional: true })
    ])
  ]),

  // 3. VERTICAL PUSH DOWN: PayPage -> WelcomePage
  transition('PayPage => WelcomePage', [
    style({ position: 'relative', overflow: 'hidden' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        'display': 'flex',
        'justify-content': 'center',
        'align-items': 'flex-start'
      })
    ], { optional: true }),
    query(':enter', [
      style({ transform: 'translateY(-100%)', zIndex: 1 })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(100%)' }))
      ], { optional: true }),
      query(':enter', [
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(0)' }))
      ], { optional: true })
    ])
  ])
]);