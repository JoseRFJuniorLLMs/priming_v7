import { Injectable } from '@angular/core';
import { VexLayoutService } from '@vex/services/vex-layout.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { NavigationItem } from './navigation-item.interface';
import { DataListService } from 'src/app/pages/apps/note/list/data-list.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationLoaderService {
  private readonly _items: BehaviorSubject<NavigationItem[]> = new BehaviorSubject<NavigationItem[]>([]);
  private totalNotesSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  get items$(): Observable<NavigationItem[]> {
    return this._items.asObservable();
  }

  constructor(
    private readonly layoutService: VexLayoutService,
    private readonly dataListService: DataListService
  ) {
    this.loadNavigation();
    this.initializeTotalNotes();
  }

  private initializeTotalNotes(): void {
    this.dataListService.getTotalNotesOfTheDay().subscribe(totalNotes => {
      this.totalNotesSubject.next(totalNotes);
      this.updateNotesBadges(totalNotes);
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
              },
              {
                type: 'link',
                label: 'Priming Puzzle',
                route: '/apps/quebra-cabeca',
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
                  value: this.totalNotesSubject.getValue().toString(),
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
                label: 'Configure Notes',
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
            label: 'chat-video',
            route: '/apps/chat-video',
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
  updateNotesBadges(totalNotes: number): void {
    const updatedItems = this._items.getValue().map(item => {
      if (item.type === 'subheading' && item.label === 'Apps') {
        item.children = item.children.map(child => {
          if (child.type === 'dropdown' && child.label === 'Notes') {
            child.children = child.children.map(noteChild => {
              if (noteChild.type === 'link' && (noteChild.label === 'List Notes')) {
                return {
                  ...noteChild,
                  badge: {
                    value: totalNotes.toString(),
                    bgClass: 'bg-purple-600',
                    textClass: 'text-white'
                  }
                };
              }
              return noteChild;
            });
          }
          return child;
        });
      }
      return item;
    });

    this._items.next(updatedItems);
  }
}