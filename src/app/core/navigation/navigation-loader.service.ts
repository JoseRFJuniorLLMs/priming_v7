import { Injectable } from '@angular/core';
import { VexLayoutService } from '@vex/services/vex-layout.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { NavigationItem } from './navigation-item.interface';

@Injectable({
  providedIn: 'root'
})
export class NavigationLoaderService {
  private readonly _items: BehaviorSubject<NavigationItem[]> =
    new BehaviorSubject<NavigationItem[]>([]);

  get items$(): Observable<NavigationItem[]> {
    return this._items.asObservable();
  }

  constructor(private readonly layoutService: VexLayoutService) {
    this.loadNavigation();
  }

  loadNavigation(): void {
    this._items.next([
      {
        type: 'subheading',
        label: 'Dashboards',
        children: [
          {
            type: 'link',
            label: 'Start',
            route: '/',
            icon: 'mat:rocket_launch',
            routerLinkActiveOptions: { exact: true }
          }
        ]
      },
      {
        type: 'subheading',
        label: 'Apps',
        children: [
          {
            type: 'dropdown',
            label: 'Games',
            icon: 'mat:gamepad',
            children: [
              {
                type: 'link',
                label: 'Priming Sticky Game',
                route: '/apps/voicegame',
                icon: 'mat:gamepad'
              },
              {
                type: 'link',
                label: 'Priming Dialog Game',
                route: '/apps/voicegame2',
                icon: 'mat:speaker_notes'
              },
              {
                type: 'link',
                label: 'Priming Hidden Game',
                route: '/apps/voicegame3',
                icon: 'mat:speaker_notes'
              },
              {
                type: 'link',
                label: 'Priming Fragment Game',
                route: '/apps/voicegame4',
                icon: 'mat:speaker_notes'
              },
              {
                type: 'link',
                label: 'Priming RC7 Game',
                route: '/apps/voicegame5',
                icon: 'mat:speaker_notes'
              }
            ]
          },
          {
            type: 'dropdown',
            label: 'Notes',
            icon: 'mat:bubble_chart',
            children: [
              {
                type: 'link',
                label: 'Notes List',
                route: '/apps/list',
                icon: 'mat:gamepad'
              },
              {
                type: 'link',
                label: 'Notes Graph',
                route: '/apps/graph',
                icon: 'mat:bubble_chart'
              },
              {
                type: 'link',
                label: 'Notes Card',
                route: '/apps/notes',
                icon: 'mat:speaker_notes'
              }
            ]
          },
          {
            type: 'dropdown',
            label: 'Books',
            icon: 'mat:menu_book',
            children: [
              {
                type: 'link',
                label: 'Books EPUB',
                route: '/apps/book2',
                icon: 'mat:menu_book'
              },
/*               {
                type: 'link',
                label: 'Books PDF',
                route: '/apps/book4',
                icon: 'mat:text_rotate_up'
              }, */
              {
                type: 'link',
                label: 'Books Text',
                route: '/apps/book3',
                icon: 'mat:text_rotate_up'
              },
              {
                type: 'link',
                label: 'Books OpenAI',
                route: '/apps/book',
                icon: 'mat:text_rotate_up'
              }
            ]
          },
          {
            type: 'link',
            label: 'Clases',
            route: '/apps/clase',
            icon: 'mat:library_books'
          },
          {
            type: 'link',
            label: 'Student Rank',
            route: '/apps/aio-table',
            icon: 'mat:assignment'
          },
          {
            type: 'link',
            label: 'Series',
            route: '/apps/editor',
            icon: 'mat:movie'
          }
        ]
      },
      {
        type: 'subheading',
        label: 'Customize',
        children: []
      },
      {
        type: 'link',
        label: 'Configuration',
        route: () => this.layoutService.openConfigpanel(),
        icon: 'mat:book'
      }
    ]);
  }
}
