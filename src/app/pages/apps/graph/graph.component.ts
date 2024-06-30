import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DataSet } from 'vis-data';
import { Network, Edge, Node } from 'vis-network';
import { DataService } from './data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VexLayoutService } from '@vex/services/vex-layout.service';
import screenfull from 'screenfull';

import { MatDialog } from '@angular/material/dialog';
import { NodeDialogComponent } from './node-dialog.component';

@Component({
  selector: 'graph-component',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class GraphComponent implements OnInit, AfterViewInit {
  @ViewChild('network', { static: true }) networkContainer!: ElementRef;

  private network!: Network;
  isMinimized = false;

  edgesOptions = {
    smooth: {
      enabled: true,
      type: 'dynamic',
      forceDirection: 'none',
      roundness: 0.5
    }
  };

  physicsOptions = {
    enabled: true,
    solver: 'barnesHut',
    barnesHut: {
      theta: 0.5,
      gravitationalConstant: -8000,
      centralGravity: 0.3,
      springLength: 95,
      springConstant: 0.04,
      damping: 0.09,
      avoidOverlap: 1
    },
    maxVelocity: 50,
    minVelocity: 0.75,
    timestep: 0.5,
    adaptiveTimestep: true
  };

  windOptions = {
    x: 0,
    y: 0
  };

  constructor(
    private dialog: MatDialog,
    private dataService: DataService,
    private layoutService: VexLayoutService,
    private cdr: ChangeDetectorRef  // Adicionado para corrigir o erro
  ) {}

  ngOnInit() {
    this.dataService.getSentences().subscribe((loadedNodes: any[]) => {
      const nodes = new DataSet<Node>([ ...loadedNodes ]);

      const edges = new DataSet<Edge>();

      const wordMap = this.dataService.getCommonWordsMap(nodes.get());

      wordMap.forEach((ids) => {
        const node = nodes.get(ids[0]);
        if (node) {
          const color = (node as any).color.background;
          if (ids.length > 1) {
            for (let i = 0; i < ids.length; i++) {
              for (let j = i + 1; j < ids.length; j++) {
                edges.add({ from: ids[i], to: ids[j], arrows: 'to', color: { color: color } });
              }
            }
          }
        }
      });

      const data = { nodes, edges };
      const options = this.getOptions();

      this.network = new Network(this.networkContainer.nativeElement, data, options);

      this.network.once('stabilizationIterationsDone', () => {
        this.network.setOptions({ physics: false });
      });

      // Adicionando tooltips aos nós
      this.network.on('hoverNode', (params) => {
        const node = nodes.get(params.node) as any;
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `<strong>${node.title}</strong><br>${node.description}<br><em>${node.tags}</em>`;
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${params.event.center.x}px`;
        tooltip.style.top = `${params.event.center.y}px`;
        tooltip.style.backgroundColor = 'white';
        tooltip.style.border = '1px solid black';
        tooltip.style.padding = '5px';
        tooltip.style.zIndex = '10';
        document.body.appendChild(tooltip);

        this.network.on('blurNode', () => {
          document.body.removeChild(tooltip);
        });
      });

      // Adicionando evento de clique no nó
      this.network.on('click', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const node = nodes.get(nodeId);
          console.log('Node data being passed to dialog:', node);  // Verificar dados no console
          this.openNodeDialog(node);
        }
      });
    });
  }

  ngAfterViewInit() {
    if (screenfull.isEnabled) {
      screenfull.request();
      this.layoutService.collapseSidenav();
      this.cdr.detectChanges();  // Corrigir ExpressionChangedAfterItHasBeenCheckedError
    }
  }

  getOptions() {
    return {
      nodes: {
        borderWidth: 4,
        size: 50,
        color: {
          border: '#222222',
          background: '#666666'
        },
        font: { color: '#000000' },
        shapeProperties: {
          useImageSize: false,
          useBorderWithImage: true
        }
      },
      edges: {
        smooth: this.edgesOptions.smooth,
        color: 'lightgray',
        arrows: {
          to: { enabled: true, scaleFactor: 1, type: 'arrow' }
        }
      },
      layout: {
        improvedLayout: true,
      },
      physics: {
        enabled: this.physicsOptions.enabled,
        solver: this.physicsOptions.solver,
        barnesHut: this.physicsOptions.barnesHut,
        maxVelocity: this.physicsOptions.maxVelocity,
        minVelocity: this.physicsOptions.minVelocity,
        timestep: this.physicsOptions.timestep,
        adaptiveTimestep: this.physicsOptions.adaptiveTimestep,
        wind: this.windOptions
      },
      interaction: {
        dragNodes: true,
        dragView: true,
        zoomView: true
      }
    };
  }

  updateOptions() {
    const options = this.getOptions();
    this.network.setOptions(options);
  }

  generateOptions() {
    console.log('Current Options:', this.getOptions());
  }

  toggleSettings() {
    this.isMinimized = !this.isMinimized;
  }

  openNodeDialog(nodeData: any) {
    console.log('Node data being passed to dialog:', nodeData);
    this.dialog.open(NodeDialogComponent, {
      data: {
        node: nodeData
      }
    });
  }
}
