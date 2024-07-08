import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DataSet } from 'vis-data';
import { Network, Edge, Node } from 'vis-network';
import { DataService } from './data.service';
import { NlpService } from './nlp.service';
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
  sentences: string[] = [];
  nodes: DataSet<Node> = new DataSet<Node>();
  edges: DataSet<Edge> = new DataSet<Edge>();
  primeToTarget: { [key: string]: string } = {};
  colorMapping: { [key: string]: string } = {};

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
    private nlpService: NlpService,
    private layoutService: VexLayoutService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Carregar mapeamentos de palavras prime-target
    this.primeToTarget = this.nlpService.getPrimeToTargetMapping();
    this.colorMapping = this.nlpService.getColorMapping();

    // Obter frases e nós
    const loadedNodes = await this.dataService.getSentences().toPromise();
    if (loadedNodes) {
      this.nodes = new DataSet<Node>(loadedNodes);
      this.sentences = loadedNodes.map(node => node.label);
    }

    // Processar similaridades e criar rede
    await this.processSentences();
    this.createNetwork();
  }

  async processSentences() {
    // Calcular similaridades entre as frases
    const similarities = await this.nlpService.calculateSimilarities(this.sentences);
    const similarityThreshold = 0.5; // Ajuste este valor conforme necessário

    for (let i = 0; i < this.sentences.length; i++) {
      for (let j = i + 1; j < this.sentences.length; j++) {
        const primeTargetRelation = this.checkPrimeTargetRelation(this.sentences[i], this.sentences[j]);
        const semanticSimilarity = similarities[i][j];

        if (primeTargetRelation || semanticSimilarity > similarityThreshold) {
          let color = 'lightgray';
          let width = 1;
          let label = '';

          if (primeTargetRelation) {
            color = this.colorMapping[primeTargetRelation.prime] || 'lightgray';
            width = 2;
            label = `${primeTargetRelation.prime} -> ${primeTargetRelation.target}`;
          } else {
            width = semanticSimilarity * 5; // Ajuste a largura da aresta baseada na similaridade
          }

          this.edges.add({
            from: i + 1,
            to: j + 1,
            arrows: 'to',
            color: { color: color },
            width: width,
            label: label
          });
        }
      }
    }
  }

  checkPrimeTargetRelation(sentence1: string, sentence2: string): { prime: string, target: string } | null {
    const words1 = sentence1.toLowerCase().split(/\W+/);
    const words2 = sentence2.toLowerCase().split(/\W+/);

    for (const word of words1) {
      if (this.primeToTarget[word] && words2.includes(this.primeToTarget[word])) {
        return { prime: word, target: this.primeToTarget[word] };
      }
    }

    for (const word of words2) {
      if (this.primeToTarget[word] && words1.includes(this.primeToTarget[word])) {
        return { prime: word, target: this.primeToTarget[word] };
      }
    }

    return null;
  }

  createNetwork() {
    const data = { nodes: this.nodes, edges: this.edges };
    const options = this.getOptions();

    this.network = new Network(this.networkContainer.nativeElement, data, options);

    this.network.once('stabilizationIterationsDone', () => {
      this.network.setOptions({ physics: false });
    });

    this.setupNetworkEvents();
  }

  setupNetworkEvents() {
    this.network.on('hoverNode', (params) => {
      const node = this.nodes.get(params.node) as any;
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.innerHTML = `<strong>${node.label}</strong>`;
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

    this.network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = this.nodes.get(nodeId);
        this.openNodeDialog(node);
      }
    });
  }

  ngAfterViewInit() {
    if (screenfull.isEnabled) {
      screenfull.request();
      this.layoutService.collapseSidenav();
      this.cdr.detectChanges();
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
    if (this.network) {
      const options = this.getOptions();
      this.network.setOptions(options);
    }
  }

  generateOptions() {
    console.log('Current Options:', this.getOptions());
  }

  toggleSettings() {
    this.isMinimized = !this.isMinimized;
  }

  openNodeDialog(nodeData: any) {
    this.dialog.open(NodeDialogComponent, {
      data: { node: nodeData }
    });
  }
}
