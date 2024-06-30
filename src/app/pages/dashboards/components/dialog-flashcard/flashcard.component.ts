import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HighlightModule } from 'ngx-highlightjs';
import { QuillEditorComponent } from 'ngx-quill';

@Component({
  selector: 'vex-flashcard',
  standalone: true,
  templateUrl: 'flashcard.component.html',
  styleUrls: ['flashcard.component.scss'],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    QuillEditorComponent,
    MatRippleModule,
    MatTooltipModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    MatStepperModule,
    MatProgressBarModule,
    MatDividerModule,
    HighlightModule,
    MatProgressSpinnerModule,
    CommonModule
  ],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ]),
      transition('* => void', [
        animate(1000, style({ opacity: 0 }))
      ])
    ])
  ]
})

export class FlashcardComponent implements AfterViewInit {

  words: string[] = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 
    'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 
    'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 
    'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 
    'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were', 'has', 'had', 
    'does', 'did', 'been', 'may', 'might', 'must', 'could', 'should', 'shall', 'would', 'many', 'much', 'few', 'little', 'some', 'all', 
    'every', 'each', 'either', 'neither', 'another', 'more', 'less', 'enough', 'plenty', 'several', 'part', 'number', 'both', 'few', 
    'next', 'last', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 
    'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 
    'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 
    'twenty-ninth', 'thirtieth', 'one hundredth', 'two hundredth', 'three hundredth', 'four hundredth', 'five hundredth', 'six hundredth', 
    'seven hundredth', 'eight hundredth', 'nine hundredth', 'thousandth', 'millionth', 'billionth', 'trillionth', 'January', 'February', 
    'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday', 'Sunday', 'red', 'blue', 'yellow', 'green', 'black', 'white', 'gray', 'orange', 'purple', 'pink', 
    'brown', 'cyan', 'magenta', 'sofa', 'table', 'chair', 'bed', 'lamp', 'desk', 'dresser', 'bookshelf', 'coffee table', 'nightstand', 
    'mirror', 'rug', 'television', 'clock', 'pillow', 'blanket', 'fridge', 'oven', 'microwave', 'toaster', 'blender', 'washing machine', 
    'dryer', 'dishwasher', 'vacuum cleaner', 'iron', 'fan', 'heater', 'curtains', 'trash can', 'passport', 'ticket', 'suitcase', 
    'backpack', 'map', 'hotel', 'flight', 'airport', 'destination', 'itinerary', 'tourist', 'guidebook', 'reservation', 'currency', 
    'visa', 'sunglasses', 'camera', 'beach', 'mountain', 'city', 'country', 'adventure', 'explore', 'souvenir', 'transportation', 
    'schedule', 'landmark', 'culture', 'cuisine', 'traveler', 'mom', 'dad', 'yes', 'no', 'please', 'thank you', 'sorry', 'hello', 
    'goodbye', 'friend', 'play', 'toy', 'game', 'ball', 'dog', 'cat', 'school', 'book', 'read', 'write', 'color', 'draw', 'paint', 
    'sing', 'dance', 'jump', 'run', 'candy', 'cookie', 'cake', 'juice', 'milk', 'water', 'bed', 'sleep', 'bath', 'brush', 'happy', 
    'sad', 'scared', 'love', 'hug', 'kiss', 'birthday', 'party', 'park', 'bike', 'slide', 'swing', 'swim', 'fish', 'bear', 'doll', 
    'car', 'truck', 'bus', 'plane', 'train', 'sun', 'moon', 'star', 'sky', 'cloud', 'rain', 'snow', 'tree', 'flower', 'grass', 'rock', 
    'sand', 'sea', 'river', 'mountain', 'forest', 'animal', 'bird', 'chicken', 'duck', 'horse', 'cow', 'pig', 'sheep', 'elephant', 
    'lion', 'tiger', 'monkey', 'zoo', 'playground', 'climber', 'bat', 'soccer', 'football', 'basketball', 'baseball', 'tennis', 
    'golf', 'ice cream', 'chocolate', 'pizza', 'burger', 'sandwich', 'salad', 'fruit', 'apple', 'banana', 'strawberry', 'cherry', 
    'grape', 'lemon', 'melon', 'peach', 'pear', 'pineapple', 'tomato', 'vegetable', 'carrot', 'potato', 'onion', 'lettuce', 
    'cucumber', 'peas', 'corn', 'bean', 'rice', 'pasta', 'bread', 'cheese', 'egg', 'meat', 'chicken', 'fish', 'juice', 'water', 
    'milk', 'tea', 'coffee', 'soda', 'story', 'movie', 'Red', 'Blue', 'Yellow', 'Green', 'Black', 'White', 'Gray', 'Orange', 'Purple', 'Pink', 'Brown', 'Cyan', 'Magenta',
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
    'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine', 'thirty',
    'one hundred', 'two hundred', 'three hundred', 'four hundred', 'five hundred', 'six hundred', 'seven hundred', 'eight hundred',
    'nine hundred', 'thousand', 'million', 'billion', 'trillion',
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
    'Sofa', 'Table', 'Chair', 'Bed', 'Lamp', 'Desk', 'Dresser', 'Bookshelf', 'Coffee Table', 'Nightstand', 'Mirror', 'Rug', 'Television', 'Clock',
    'Pillow', 'Blanket', 'Fridge', 'Oven', 'Microwave', 'Toaster', 'Blender', 'Washing Machine', 'Dryer', 'Dishwasher', 'Vacuum Cleaner', 'Iron', 'Fan', 'Heater', 'Curtains', 'Trash Can',
    'Passport', 'Ticket', 'Suitcase', 'Backpack', 'Map', 'Hotel', 'Flight', 'Airport', 'Destination', 'Itinerary', 'Tourist', 'Guidebook', 'Reservation', 'Currency', 'Visa',
    'Sunglasses', 'Camera', 'Beach', 'Mountain', 'City', 'Country', 'Adventure', 'Explore', 'Souvenir', 'Transportation', 'Schedule', 'Landmark', 'Culture', 'Cuisine', 'Traveler',
    'Mom', 'Dad', 'Yes', 'No', 'Please', 'Thank you', 'Sorry', 'Hello', 'Goodbye', 'Friend', 'Play', 'Toy', 'Game', 'Ball',
    'Dog', 'Cat', 'School', 'Book', 'Read', 'Write', 'Color', 'Draw', 'Paint', 'Sing', 'Dance', 'Jump', 'Run',
    'Candy', 'Cookie', 'Cake', 'Juice', 'Milk', 'Water', 'Bed', 'Sleep', 'Bath', 'Brush', 'Happy', 'Sad', 'Scared',
    'Love', 'Hug', 'Kiss', 'Birthday', 'Party', 'Park', 'Bike', 'Slide', 'Swing', 'Swim', 'Fish', 'Bear', 'Doll', 'Car',
    'Truck', 'Bus', 'Plane', 'Train', 'Sun', 'Moon', 'Star', 'Sky', 'Cloud', 'Rain', 'Snow', 'Tree', 'Flower', 'Grass',
    'Rock', 'Sand', 'Sea', 'River', 'Mountain', 'Forest', 'Animal', 'Bird', 'Chicken', 'Duck', 'Horse', 'Cow', 'Pig',
    'Sheep', 'Elephant', 'Lion', 'Tiger', 'Monkey', 'Zoo', 'Playground', 'Slide', 'Swing', 'Climber', 'Ball', 'Bat',
    'Soccer', 'Football', 'Basketball', 'Baseball', 'Tennis', 'Golf', 'Ice cream', 'Chocolate', 'Pizza', 'Burger', 'Sandwich',
    'Salad', 'Fruit', 'Apple', 'Banana', 'Orange', 'Strawberry', 'Cherry', 'Grape', 'Lemon', 'Melon', 'Peach', 'Pear',
    'Pineapple', 'Tomato', 'Vegetable', 'Carrot', 'Potato', 'Onion', 'Lettuce', 'Cucumber', 'Peas', 'Corn', 'Bean', 'Rice',
    'Pasta', 'Bread', 'Cheese', 'Egg', 'Meat', 'Chicken', 'Fish', 'Juice', 'Water', 'Milk', 'Tea', 'Coffee', 'Soda', 'Story',
    'Book', 'Movie', 'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for', 'not', 'on', 'with', 'he',
    'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
    'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
    'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
    'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also'
  ];


  translations: string[] = [
    'o, a, os, as', 'ser, estar', 'para, a', 'de', 'e', 'um, uma', 'em', 'que', 'ter', 'eu', 'ele, ela, isso', 'para', 'não', 'em, sobre', 'com', 'ele', 'como', 'você', 'fazer', 'em',
    'isso', 'mas', 'dele', 'por', 'de', 'eles', 'nós', 'dizer', 'dela', 'ela', 'ou', 'um, uma', 'vai', 'meu', 'um', 'todo, todos', 'iria', 'lá', 'deles', 'o que', 'então', 'acima', 'fora', 'se',
    'sobre', 'quem', 'obter', 'qual', 'ir', 'me', 'quando', 'fazer', 'poder', 'gostar', 'tempo', 'não', 'apenas', 'ele', 'saber', 'pegar', 'pessoas', 'em', 'ano', 'seu', 'bom', 'algum',
    'poderia', 'eles', 'ver', 'outro', 'do que', 'então', 'agora', 'olhar', 'somente', 'vir', 'seu', 'sobre', 'pensar', 'também', 'voltar', 'depois', 'usar', 'dois', 'como', 'nosso', 'trabalhar',
    'primeiro', 'bem', 'caminho', 'até mesmo', 'novo', 'querer', 'porque', 'algum', 'estes', 'dar', 'dia', 'mais', 'nós', 'é', 'são', 'foi', 'eram', 'tem', 'teve', 'faz', 'fez', 'sido', 'pode',
    'poderia', 'deve', 'deve', 'deveria', 'iria', 'muitos', 'muito', 'poucos', 'pouco', 'alguns', 'todos', 'cada', 'outro', 'nenhum', 'outro', 'mais', 'menos', 'suficiente', 'bastante', 'vários',
    'parte', 'número', 'ambos', 'poucos', 'próximo', 'último', 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'sétimo', 'oitavo', 'nono', 'décimo', 'décimo primeiro',
    'décimo segundo', 'décimo terceiro', 'décimo quarto', 'décimo quinto', 'décimo sexto', 'décimo sétimo', 'décimo oitavo', 'décimo nono', 'vigésimo', 'vigésimo primeiro',
    'vigésimo segundo', 'vigésimo terceiro', 'vigésimo quarto', 'vigésimo quinto', 'vigésimo sexto', 'vigésimo sétimo', 'vigésimo oitavo', 'vigésimo nono', 'trigésimo',
    'centésimo', 'ducentésimo', 'trecentésimo', 'quadrigentésimo', 'quingentésimo', 'seiscentésimo', 'setingentésimo', 'oitocentésimo', 'nongentésimo', 'milésimo',
    'milionésimo', 'bilionésimo', 'trilionésimo', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo', 'vermelho', 'azul', 'amarelo', 'verde', 'preto', 'branco', 'cinza', 'laranja',
    'roxo', 'rosa', 'marrom', 'ciano', 'magenta', 'sofá', 'mesa', 'cadeira', 'cama', 'lâmpada', 'escrivaninha', 'cômoda', 'estante', 'mesa de centro', 'criado-mudo', 'espelho', 'tapete',
    'televisão', 'relógio', 'travesseiro', 'cobertor', 'geladeira', 'forno', 'microondas', 'torradeira', 'liquidificador', 'máquina de lavar', 'secadora', 'lava-louças', 'aspirador de pó',
    'ferro', 'ventilador', 'aquecedor', 'cortinas', 'lixeira', 'passaporte', 'bilhete', 'mala', 'mochila', 'mapa', 'hotel', 'voo', 'aeroporto', 'destino', 'itinerário', 'turista', 'guia de viagem',
    'reserva', 'moeda', 'visto', 'óculos de sol', 'câmera', 'praia', 'montanha', 'cidade', 'país', 'aventura', 'explorar', 'souvenir', 'transporte', 'horário', 'marco', 'cultura', 'culinária',
    'viajante', 'mãe', 'pai', 'sim', 'não', 'por favor', 'obrigado', 'desculpe', 'olá', 'adeus', 'amigo', 'brincar', 'brinquedo', 'jogo', 'bola', 'cachorro', 'gato', 'escola', 'livro', 'ler',
    'escrever', 'cor', 'desenhar', 'pintar', 'cantar', 'dançar', 'pular', 'correr', 'doce', 'biscoito', 'bolo', 'suco', 'leite', 'água', 'cama', 'dormir', 'banho', 'escovar', 'feliz', 'triste',
    'assustado', 'amor', 'abraço', 'beijo', 'aniversário', 'festa', 'parque', 'bicicleta', 'escorregar', 'balanço', 'nadar', 'peixe', 'urso', 'boneca', 'carro', 'caminhão', 'ônibus', 'avião',
    'trem', 'sol', 'lua', 'estrela', 'céu', 'nuvem', 'chuva', 'neve', 'árvore', 'flor', 'grama', 'rocha', 'areia', 'mar', 'rio', 'montanha', 'floresta', 'animal', 'pássaro', 'galinha', 'pato',
    'cavalo', 'vaca', 'porco', 'ovelha', 'elefante', 'leão', 'tigre', 'macaco', 'zoológico', 'parquinho', 'escalar', 'bastão', 'futebol', 'futebol americano', 'basquete', 'beisebol', 'tênis',
    'golfe', 'sorvete', 'chocolate', 'pizza', 'hambúrguer', 'sanduíche', 'salada', 'fruta', 'maçã', 'banana', 'laranja', 'morango', 'cereja', 'uva', 'limão', 'melão', 'pêssego', 'pêra',
    'abacaxi', 'tomate', 'legume', 'cenoura', 'batata', 'cebola', 'alface', 'pepino', 'ervilhas', 'milho', 'feijão', 'arroz', 'macarrão', 'pão', 'queijo', 'ovo', 'carne', 'frango', 'peixe',
    'suco', 'água', 'leite', 'chá', 'café', 'refrigerante', 'história', 'filme'
  ];
  
  currentWordIndex = 0;
  isLoading = false;
  errorText = "";
  showTranslation = false;

  ngAfterViewInit(): void {
    this.speakWord(this.words[this.currentWordIndex]);
  }

  showNextWord(): void {
    this.showTranslation = false;
    this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
    this.speakWord(this.words[this.currentWordIndex]);
  }



  showTranslationAndSpeak(): void {
    this.showTranslation = true;
    this.speakTranslation(this.translations[this.currentWordIndex]);
  }

  toggleAutoChange(): void {
    if (this.autoChangeEnabled) {
      clearInterval(this.autoChangeInterval);
    } else {
      this.autoChangeInterval = setInterval(() => {
        this.speakWord(this.words[this.currentWordIndex], () => {
          this.showTranslation = true;
          this.speakTranslation(this.translations[this.currentWordIndex], () => {
            this.showNextWord();
            this.showTranslation = false;
          });
        });
      }, 6000); // Intervalo total (ajuste conforme necessário)
    }
    this.autoChangeEnabled = !this.autoChangeEnabled;
  }
  
  speakWord(word: string, callback?: () => void): void {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
  
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => voice.name === 'Google UK English Female');
  
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else {
        console.warn('Voz "Google UK English Female" não encontrada, usando a voz padrão.');
      }
  
      utterance.onend = () => {
        if (callback) {
          callback();
        }
      };
  
      window.speechSynthesis.speak(utterance);
    };
  
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    } else {
      setVoice();
    }
  }
  
  speakTranslation(translation: string, callback?: () => void): void {
    const utterance = new SpeechSynthesisUtterance(translation);
    utterance.lang = 'pt-BR';
  
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => voice.name === 'Google português do Brasil');
  
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else {
        console.warn('Voz "Google português do Brasil" não encontrada, usando a voz padrão.');
      }
  
      utterance.onend = () => {
        if (callback) {
          callback();
        }
      };
  
      window.speechSynthesis.speak(utterance);
    };
  
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    } else {
      setVoice();
    }
  }
  

  autoChangeEnabled = false;
  autoChangeInterval: any;
}
