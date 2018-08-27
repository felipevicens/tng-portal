import { Injectable } from "@angular/core";
import { ConfigService } from "../shared/services/config/config.service";
import { AuthService } from "../authentication/auth.service";

import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable()
export class ValidationAndVerificationPlatformService {
  authHeaders: HttpHeaders;
  request_uuid: string;
  // pagination: string = "?page_size=20&page_number=1";

  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private http: HttpClient
  ) {}

  /**
   * Retrieves a list of tests.
   * Either following a search pattern or not.
   *
   * @param search [Optional] Test attributes that must be
   *                          matched by the returned list of
   *                          tests.
   */
  getTests(search?): any {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();
      let url =
        search != undefined
          ? this.config.baseVNV + this.config.tests + search
          : this.config.baseVNV + this.config.tests;

      this.http
        .get(url, {
          headers: headers
        })
        .toPromise()
        .then(response => {
          if (response instanceof Array) {
            resolve(
              response.map(item => {
                return {
                  uuid: item.uuid,
                  name: item.testd.name,
                  vendor: item.testd.vendor,
                  version: item.testd.version,
                  status: item.status
                };
              })
            );
          } else {
            reject();
          }
        })
        .catch(err => reject(err.statusText));
    });
  }

  /**
   * Retrieves a Test by UUID
   *
   * @param uuid UUID of the desired Test.
   */
  getOneTest(uuid: string) {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();

      this.http
        .get(this.config.baseVNV + this.config.tests + "/" + uuid, {
          headers: headers
        })
        .toPromise()
        .then(response => {
          resolve({
            uuid: response["uuid"],
            name: response["testd"]["name"],
            vendor: response["testd"]["vendor"],
            version: response["testd"]["version"],
            // timesExecuted: response["testd"]
            timesExecuted: "20",
            author: response["testd"]["author"],
            description: response["testd"]["description"],
            createdAt: response["created_at"],
            status: response["status"],
            // lastTimeExecuted: response["testd"]
            lastTimeExecuted: "this is date",
            // services: response["testd"]
            services: [
              {
                sVendor: "svendor",
                sName: "sname",
                sVersion: "0.3"
              },
              {
                sVendor: "svendor2",
                sName: "sname2",
                sVersion: "0.2"
              }
            ]
          });
        })
        .catch(err => reject(err.statusText));
    });
  }

  /**
   * Launches a test or the test's of a service by UUID
   *
   * @param type Type of tests being launched: a test itself [test]
   *                   or the tests related to a service [service]
   * @param uuid UUID of the desired Test or Service
   */
  postOneTest(type: string, uuid: string) {
    return new Promise((resolve, reject) => {
      let headers = this.authService.getAuthHeaders();

      let data;
      if (type == "test") {
        data = {
          test_uuid: uuid
        };
      } else if (type == "service") {
        data = {
          service_uuid: uuid
        };
      } else {
        reject("There was an error while trying to execute the tests");
      }

      this.http
        .post(this.config.baseVNV + this.config.testExecutions, {
          headers: headers
        })
        .toPromise()
        .then(response => {
          resolve(response);
        })
        .catch(err => reject("There was an error executing the test!"));
    });
  }
}
