import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false,
})
export class SplashPage implements OnInit, OnDestroy {
  private navigationTimer?: ReturnType<typeof setTimeout>;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.navigationTimer = setTimeout(() => {
      this.router.navigateByUrl('/login', {
        replaceUrl: true,
      });
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.navigationTimer) {
      clearTimeout(this.navigationTimer);
    }
  }
}