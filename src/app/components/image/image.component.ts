import { Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { GetimgUploadService } from './getimg-upload.service';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent  {

  constructor(
    private _GetimgUploadService: GetimgUploadService,
    public dialogRef: MatDialogRef<ImageComponent>,
    @Inject(MAT_DIALOG_DATA) public img: string
  ) { 

    console.log(img)
  }


  onNoClick(deleted: boolean) {
    this.dialogRef.close(deleted);
  }


}
