import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  constructor(private credService: MsalService) {}
}
