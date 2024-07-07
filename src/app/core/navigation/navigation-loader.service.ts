import { Injectable } from '@angular/core';
import { VexLayoutService } from '@vex/services/vex-layout.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { NavigationItem } from './navigation-item.interface';
import { DataListService } from 'src/app/pages/apps/list/data-list.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationLoaderService {
  private readonly _items: BehaviorSubject<NavigationItem[]> = new BehaviorSubject<NavigationItem[]>([]);

  get items$(): Observable<NavigationItem[]> {
    return this._items.asObservable();
  }

  constructor(
    private readonly layoutService: VexLayoutService,
    private readonly dataListService: DataListService // Injetando o DataListService
  ) {
    this.loadNavigation();
    // Inscreve-se para atualizações do total de notas do dia
    this.dataListService.getTotalNotesOfTheDay().subscribe(totalNotes => {
      this.updateSharedNotesBadge(totalNotes);
    });
  }

  loadNavigation(): void {
    this._items.next([
      {
        type: 'link',
        label: 'Login',
        route: '/login',
        icon: 'mat:login'
      },
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
              },
              {
                type: 'link',
                label: 'Priming Memory Game',
                route: '/apps/card',
                icon: 'mat:speaker_notes'
              },
              {
                type: 'link',
                label: 'Priming Tetris Game',
                route: '/apps/teris',
                icon: 'mat:speaker_notes'
              },
              {
                type: 'link',
                label: 'Priming Dino Game',
                route: '/apps/dino',
                icon: 'mat:speaker_notes'
              },
              {
                type: 'link',
                label: 'Priming Word-Search Game',
                route: '/apps/word-search',
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
                label: 'List Notes',
                route: '/apps/list',
                icon: 'mat:gamepad',
                badge: {
                  value: '', // Valor inicial vazio
                  bgClass: 'bg-purple-600',
                  textClass: 'text-white'
                }
              },
              {
                type: 'link',
                label: 'Graph Notes',
                route: '/apps/graph',
                icon: 'mat:bubble_chart'
              },
              {
                type: 'link',
                label: 'Shared Notes',
                route: '/apps/notes',
                icon: 'mat:speaker_notes',
                badge: {
                  value: '', // Valor inicial vazio
                  bgClass: 'bg-purple-600',
                  textClass: 'text-white'
                }
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
        label: 'Pages',
        children: [
          {
            type: 'link',
            label: 'FAQ',
            route: '/pages/faq',
            icon: 'mat:help'
          },
          {
            type: 'link',
            label: 'Invoice',
            route: '/pages/invoice',
            icon: 'mat:receipt'
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
      },
      {
        type: 'link',
        label: 'Register',
        route: '/register',
        icon: 'mat:person_add'
      },
      {
        type: 'link',
        label: 'Forgot Password',
        route: '/forgot-password',
        icon: 'mat:lock_open'
      }
    ]);
  }

  // Método para atualizar o badge de "Shared Notes"
  updateSharedNotesBadge(totalNotes: number): void {
    const updatedItems = this._items.getValue().map(item => {
      if (item.type === 'dropdown' && item.label === 'Notes') {
        item.children = item.children.map(child => {
          if (child.type === 'link' && child.label === 'Shared Notes' && child.badge) {
            return {
              ...child,
              badge: {
                ...child.badge,
                value: totalNotes.toString(),
                bgClass: 'bg-purple-600',
                textClass: 'text-white'
              }
            };
          }
          return child;
        });
      }
      return item;
    });

    this._items.next(updatedItems);
  }
}
