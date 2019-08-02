import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';



@Injectable()
export class SdkService {
	// see guide here: https://angularfirebase.com/lessons/sharing-data-between-angular-components-four-methods/
	private fileUrlsSource = new BehaviorSubject([]);
	currentFileUrls = this.fileUrlsSource.asObservable();

	constructor(private http: HttpClient) { }

	changeFiles(fileUrls: Array<string>) {
		// set new file URLs
		console.log(this.currentFileUrls);
		this.fileUrlsSource.next(fileUrls);
		console.log(this.currentFileUrls);
	}
}
