import { Component, Input, OnInit } from '@angular/core';
import { FileService } from '../../../core/services/file.service';

@Component({
  selector: 'app-image-preview',
  imports: [],
  templateUrl: './image-preview.html',
  styleUrl: './image-preview.css'
})
export class ImagePreview implements OnInit {
  @Input({ required: true }) fileId!: number;
  @Input() alt: string = 'Unknow'

  imageUrl: string | null = null

  constructor(
    private fileService: FileService
  ) { }

  async ngOnInit() {
    this.imageUrl = await this.fileService.getFileUrl(this.fileId)
  }
}
