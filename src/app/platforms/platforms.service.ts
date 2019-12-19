import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ConfigService } from '../shared/services/config/config.service';
import { AuthService } from '../authentication/auth.service';
import { UtilsService } from '../shared/services/common/utils.service';

@Injectable()
export class PlatformsService {
	authHeaders: HttpHeaders;

	constructor(
		private authService: AuthService,
		private utilsService: UtilsService,
		private config: ConfigService,
		private http: HttpClient
	) { }

	/**
     * Retrieves a list of VIMs.
     * Either following a search pattern or not.
     *
     * @param search [Optional] VIMs attributes that must be
     *                          matched by the returned list.
     */
	async getPlatforms(search?) {
		const headers = this.authService.getAuthHeaders();
		const url = search ? this.config.baseVNV + this.config.platformSettings + search
			: this.config.baseVNV + this.config.platformSettings;

		try {
			const response = await this.http.get(url, { headers: headers }).toPromise();
			return response instanceof Array ?
				response : [];
		} catch (error) {
			if (error.status === 401 && error.statusText === 'Unauthorized') {
				this.utilsService.launchUnauthorizedError();
			}

			console.error(error);
		}
	}

	/**
	 * Retrieves a platform by UUID
	 *
	 * @param uuid Platform UUID
	 */
	async getOnePlatform(uuid) {
		const headers = this.authService.getAuthHeaders();
		const url = this.config.baseVNV + this.config.platformSettings + '/' + uuid;

		try {
			const response = await this.http.get(url, { headers: headers }).toPromise();
			delete response['monitoring_urls'];
			return response;
		} catch (error) {
			if (error.status === 401 && error.statusText === 'Unauthorized') {
				this.utilsService.launchUnauthorizedError();
			}

			console.error(error);
		}
	}

	/**
     * Generates a platform
     *
     * @param platform Data of the desired platform.
     */
	async postPlatform(platform) {
		const headers = this.authService.getAuthHeadersContentTypeJSON();
		const url = this.config.baseVNV + this.config.platformSettings;

		try {
			return await this.http.post(url, platform, { headers: headers }).toPromise();
		} catch (error) {
			if (error.status === 401 && error.statusText === 'Unauthorized') {
				this.utilsService.launchUnauthorizedError();
			}

			console.error(error);
		}
	}

	/**
     * Updates a platform
     *
     * @param platform Data of the desired platform.
     */
	async patchPlatform(uuid, platform) {
		const headers = this.authService.getAuthHeadersContentTypeJSON();
		const url = this.config.baseVNV + this.config.platformSettings + '/' + uuid;

		try {
			return await this.http.patch(url, platform, { headers: headers }).toPromise();
		} catch (error) {
			if (error.status === 401 && error.statusText === 'Unauthorized') {
				this.utilsService.launchUnauthorizedError();
			}

			console.error(error);
		}
	}

	/**
 	* Deletes a platform
 	*
 	* @param uuid UUID of the desired WIM.
 	*/
	async deletePlatform(uuid) {
		const headers = this.authService.getAuthHeaders();
		const url = this.config.baseVNV + this.config.platformSettings + '/' + uuid;

		try {
			return await this.http.delete(url, { headers: headers }).toPromise();
		} catch (error) {
			if (error.status === 401 && error.statusText === 'Unauthorized') {
				this.utilsService.launchUnauthorizedError();
			}

			console.error(error);
		}
	}

}
