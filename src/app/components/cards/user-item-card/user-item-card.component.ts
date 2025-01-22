import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IUserListItem } from 'src/app/interfaces/contratos';

@Component({
  selector: 'app-user-item-card',
  templateUrl: './user-item-card.component.html',
  styleUrls: ['./user-item-card.component.scss']
})
export class UserItemCardComponent implements OnInit {
  @Output() onUserSelected = new EventEmitter<IUserListItem>()
  @Input() userItem: IUserListItem

  constructor() { }

  ngOnInit(): void {
  }

  public onUserClick = () => {
    this.onUserSelected.emit(this.userItem)
  }

}
