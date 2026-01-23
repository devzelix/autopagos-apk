import { Component, OnInit, OnDestroy, HostListener, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ad-carousel',
  templateUrl: './ad-carousel.component.html',
  styleUrls: ['./ad-carousel.component.scss']
})
export class AdCarouselComponent implements OnInit, OnDestroy {
  @Output() touch = new EventEmitter<void>();
  @ViewChild('videoPlayer', { static: false }) videoPlayer?: ElementRef<HTMLVideoElement>;
  
  private destroy$ = new Subject<void>();
  private carouselInterval: any;
  public currentIndex = 0;
  
  // Array de medios publicitarios optimizados para pantalla vertical 15.6"
  // Las imágenes y videos deben estar en formato vertical (portrait)
  // Resolución recomendada: 1080x1920 (Full HD vertical) o 1440x2560 (2K vertical)
  public adMedia: Array<{
    type: 'image' | 'video';
    src: string;
    alt?: string;
    poster?: string; // Para videos, imagen de portada
  }> = [
    { 
      type: 'image', 
      src: 'assets/images/ads/imagen1.jpg', 
      alt: 'Publicidad 1' 
    },
    { 
      type: 'image', 
      src: 'assets/images/ads/imagen2.jpg', 
      alt: 'Publicidad 2' 
    },
    // Agregar más medios aquí - todos en formato vertical
  ];

  constructor() { }

  ngOnInit(): void {
    console.log('AdCarousel iniciado. Medios disponibles:', this.adMedia.length);
    console.log('Medios:', this.adMedia);
    
    // Verificar que hay medios disponibles
    if (this.adMedia.length === 0) {
      console.warn('No hay medios publicitarios configurados');
      return;
    }
    
    this.startCarousel();
    this.preloadMedia();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.pauseAllVideos();
    
    // Limpiar el intervalo del carrusel
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  /**
   * Precarga los medios para mejor rendimiento
   */
  private preloadMedia(): void {
    this.adMedia.forEach(media => {
      if (media.type === 'image') {
        const img = new Image();
        img.src = media.src;
      } else if (media.type === 'video') {
        const video = document.createElement('video');
        video.src = media.src;
        video.preload = 'auto';
      }
    });
  }

  /**
   * Inicia el carrusel automático (cambia cada 12 segundos)
   */
  private startCarousel(): void {
    // Limpiar cualquier intervalo anterior
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    
    // Iniciar el carrusel automático
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 12000);
  }

  /**
   * Siguiente slide
   */
  public nextSlide(): void {
    this.pauseAllVideos();
    this.currentIndex = (this.currentIndex + 1) % this.adMedia.length;
    this.playCurrentVideo();
  }

  /**
   * Slide anterior
   */
  public previousSlide(): void {
    this.pauseAllVideos();
    this.currentIndex = (this.currentIndex - 1 + this.adMedia.length) % this.adMedia.length;
    this.playCurrentVideo();
  }

  /**
   * Ir a un slide específico
   */
  public goToSlide(index: number): void {
    this.pauseAllVideos();
    this.currentIndex = index;
    this.playCurrentVideo();
  }

  /**
   * Reproduce el video actual si existe
   */
  private playCurrentVideo(): void {
    setTimeout(() => {
      const currentMedia = this.adMedia[this.currentIndex];
      if (currentMedia.type === 'video') {
        const videos = document.querySelectorAll('.carousel-slide video');
        if (videos[this.currentIndex]) {
          (videos[this.currentIndex] as HTMLVideoElement).play().catch(err => {
            console.error('Error al reproducir video:', err);
          });
        }
      }
    }, 100);
  }

  /**
   * Pausa todos los videos
   */
  private pauseAllVideos(): void {
    const videos = document.querySelectorAll('.carousel-slide video');
    videos.forEach((video: any) => {
      video.pause();
      video.currentTime = 0;
    });
  }

  /**
   * Detectar toque en cualquier parte de la pantalla
   */
  @HostListener('touchstart', ['$event'])
  @HostListener('click', ['$event'])
  onTouch(event: Event): void {
    event.stopPropagation();
    this.touch.emit();
  }

  /**
   * Maneja cuando una imagen se carga correctamente
   */
  onImageLoad(event: Event): void {
    console.log('Imagen cargada exitosamente:', (event.target as HTMLImageElement).src);
  }

  /**
   * Maneja errores al cargar imágenes
   */
  handleImageError(event: any): void {
    const imgElement = event.target as HTMLImageElement;
    console.error('Error al cargar imagen:', imgElement.src);
    console.error('Ruta intentada:', imgElement.src);
    
    // Si falla la imagen, crear un placeholder
    if (imgElement) {
      // Crear una imagen de placeholder con canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Imagen no disponible', canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = '32px Arial';
        ctx.fillText('Verifique la ruta:', canvas.width / 2, canvas.height / 2 + 30);
        ctx.font = '24px Arial';
        const text = imgElement.src.split('/').pop() || 'imagen';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 70);
        imgElement.src = canvas.toDataURL();
        imgElement.style.display = 'block';
      }
    }
  }

  /**
   * Maneja cuando un video está listo para reproducir
   */
  onVideoLoaded(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (this.adMedia[this.currentIndex].type === 'video') {
      video.play().catch(err => {
        console.error('Error al reproducir video:', err);
      });
    }
  }

  /**
   * Maneja errores al cargar videos
   */
  handleVideoError(event: Event): void {
    console.error('Error al cargar video:', event);
    // Opcional: cargar un video por defecto o mostrar un mensaje
  }
}

