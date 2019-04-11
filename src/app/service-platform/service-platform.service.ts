import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ConfigService } from '../shared/services/config/config.service';
import { AuthService } from '../authentication/auth.service';
import { UtilsService } from '../shared/services/common/utils.service';

@Injectable()
export class ServicePlatformService {
	authHeaders: HttpHeaders;
	request_uuid: string;
	// pagination: string = '?page_size=20&page_number=1';

	constructor(
		private utilsService: UtilsService,
		private authService: AuthService,
		private config: ConfigService,
		private http: HttpClient
	) { }

	/**
     * Retrieves a Function by UUID
     *
     * @param uuid UUID of the desired Function.
     */
	getOneFunction(uuid: string): any {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();
			this.http
				.get(this.config.baseSP + this.config.functions + '/' + uuid, {
					headers: headers
				})
				.toPromise()
				.then(response => {
					resolve({
						uuid: response[ 'uuid' ],
						name: response[ 'vnfd' ][ 'name' ],
						author: response[ 'vnfd' ][ 'author' ],
						createdAt: this.utilsService.formatUTCDate(response[ 'created_at' ]),
						updatedAt: this.utilsService.formatUTCDate(response[ 'updated_at' ]),
						vendor: response[ 'vnfd' ][ 'vendor' ],
						version: response[ 'vnfd' ][ 'version' ],
						type: 'Public',
						status: this.utilsService.capitalizeFirstLetter(response[ 'status' ]),
						description: response[ 'vnfd' ][ 'description' ]
					});
				})
				.catch(err => reject('There was an error fetching the function'));
		});
	}

	/**
     * Retrieves a SLA Template by UUID
     *
     * @param uuid UUID of the desired SLA Template.
     */
	getOneSLATemplate(uuid): any {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();
			this.http
				.get(this.config.baseSP + this.config.slaTemplates + '/' + uuid, {
					headers: headers
				})
				.toPromise()
				.then(response => {
					resolve({
						uuid: response[ 'uuid' ],
						name: response[ 'slad' ][ 'name' ],
						vendor: response[ 'slad' ][ 'vendor' ],
						author: response[ 'slad' ][ 'author' ],
						createdAt: this.utilsService.formatUTCDate(response[ 'created_at' ]),
						expirationDate: new Date(
							Date.parse(response[ 'slad' ][ 'sla_template' ][ 'valid_until' ])
						),
						ns: response[ 'slad' ][ 'sla_template' ][ 'ns' ][ 'ns_name' ],
						storedGuarantees:
							response[ 'slad' ][ 'sla_template' ][ 'ns' ][ 'guaranteeTerms' ]
					});
				})
				.catch(err => reject('There was an error fetching the SLA template'));
		});
	}

	/**
     * Retrieves a list with all the service guarantees
     */
	getServiceGuarantees(): any {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();

			this.http
				.get(this.config.baseSP + this.config.guarantees, {
					headers: headers
				})
				.toPromise()
				.then(response => {
					resolve(response[ 'guaranteeTerms' ]);
				})
				.catch(err => {
					reject('There was an error fetching the service guarantees');
				});
		});
	}

	/**
     * Creates a new SLA Template.
     *
     * @param template Object containing the nsd_uuid, guaranteeId, expireDate
     *                 and templateName for the creation of a new template.
     */
	postOneSLATemplate(template): any {
		return new Promise((resolve, reject) => {
			this.http
				.post(
					this.config.baseSP + this.config.slaTemplates,
					this.urlEncode(template),
					{
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						}
					}
				)
				.toPromise()
				.then(response => {
					resolve();
				})
				.catch(err => reject(err));
		});
	}

	urlEncode(obj: Object): string {
		let str = '';
		Object.keys(obj).forEach(key => {
			if (obj[ key ] instanceof Array) {
				obj[ key ].forEach(item => {
					str +=
						(str.length > 0 ? '&' : '') +
						encodeURI(key) +
						'=' +
						encodeURI(item);
				});
			} else {
				str +=
					(str.length > 0 ? '&' : '') +
					encodeURI(key) +
					'=' +
					encodeURI(obj[ key ]);
			}
		});
		return str;
	}

	/**
     * Removes the specified template from the database
     *
     * @param uuid UUID of the desired SLA Template.
     */
	deleteOneSLATemplate(uuid: string): any {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();

			this.http
				.delete(this.config.baseSP + this.config.slaTemplates + '/' + uuid, {
					headers: headers,
					responseType: 'text'
				})
				.toPromise()
				.then(response => {
					resolve();
				})
				.catch(err => {
					reject('There was an error deleting the sla template');
				});
		});
	}

	/**
     * Retrieves a list of SLA Agreements.
     * Either following a search pattern or not.
     *
     * @param search [Optional] Agreement attributes that must be
     *                          matched by the returned list of
     *                          SLA Agreements.
     */
	getSLAAgreements(search?): any {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();
			const url =
				search !== undefined
					? this.config.baseSP + this.config.slaAgreements + search
					: this.config.baseSP + this.config.slaAgreements;

			this.http
				.get(url, {
					headers: headers
				})
				.toPromise()
				.then(response => {
					resolve(
						response[ 'agreements' ].map(item => {
							return {
								uuid: item.sla_uuid,
								name: item.sla_name,
								ns: item.ns_name,
								ns_uuid: item.ns_uuid,
								customer: item.cust_uuid,
								date: this.utilsService.formatUTCDate(item.sla_date),
								status: this.utilsService.capitalizeFirstLetter(item.sla_status)
							};
						})
					);
				})
				.catch(err => reject('There was an error fetching the SLA agreements'));
		});
	}

	/**
     * Retrieves a SLA Agreement by UUID
     *
     * @param uuid UUID of the desired SLA Agreement.
     */
	getOneSLAAgreement(sla_uuid: string, ns_uuid: string): any {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();
			this.http
				.get(
					this.config.baseSP +
					this.config.slaAgreements +
					'/' +
					sla_uuid +
					'/' +
					ns_uuid,
					{
						headers: headers
					}
				)
				.toPromise()
				.then(response => {
					resolve({
						uuid: response[ 'uuid' ],
						name: response[ 'slad' ][ 'name' ],
						author: response[ 'slad' ][ 'author' ],
						date: this.utilsService.formatUTCDate(response[ 'updated_at' ]),
						ns: response[ 'slad' ][ 'sla_template' ][ 'ns' ][ 'ns_name' ],
						customer:
							response[ 'slad' ][ 'sla_template' ][ 'customer_info' ][ 'cust_uuid' ],
						status: this.utilsService.capitalizeFirstLetter(response[ 'status' ]),
						propertyList:
							response[ 'slad' ][ 'sla_template' ][ 'ns' ][ 'guaranteeTerms' ]
						// availability: response['availability'],
						// cost: response['cost']
					});
				})
				.catch(err => reject('There was an error fetching the SLA agreement'));
		});
	}

	/**
     * Retrieves a list of SLA Violations.
     * Either following a search pattern or not.
     *
     * @param search [Optional] Violation attributes that must be
     *                          matched by the returned list of
     *                          SLA Violations.
     */
	getSLAViolations(search?): any {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();
			const url =
				search !== undefined
					? this.config.baseSP + this.config.slaViolations + search
					: this.config.baseSP + this.config.slaViolations;

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
									nsInstanceUUID: item.nsi_uuid,
									slaUUID: item.sla_uuid,
									date: this.utilsService.formatUTCDate(item.violation_time),
									customerUUID: item.cust_uuid
								};
							})
						);
					} else {
						reject('There was an error while fetching the SLA violations');
					}
				})
				.catch(err =>
					reject('There was an error while fetching the SLA violations')
				);
		});
	}

	/**
     * Retrieves a list of Runtime Policies.
     * Either following a search pattern or not.
     *
     * @param search [Optional] Policy attributes that must be
     *                          matched by the returned list of
     *                          Runtime Policies.
     */
	getRuntimePolicies(search?): any {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();
			const url =
				search !== undefined
					? this.config.baseSP + this.config.runtimePolicies + search
					: this.config.baseSP + this.config.runtimePolicies;

			this.http
				.get(url, {
					headers: headers
				})
				.toPromise()
				.then(response => {
					if (response instanceof Array) {
						resolve(
							response.filter(policy => policy.ns_uuid).map(item => {
								return {
									uuid: item.uuid,
									name: item.pld.name,
									version: item.pld.version,
									vendor: item.pld.vendor,
									ns: item.pld.network_service,
									ns_uuid: item.ns_uuid,
									sla: item.sla_name || 'None',
									default: item.default_policy,
									enforced: item.enforced ? 'Yes' : 'No'
								};
							})
						);
					} else {
						reject('There was an error while fetching the policies');
					}
				})
				.catch(err => reject('There was an error while fetching the policies'));
		});
	}

	/**
     * Retrieves a Runtime Policy by UUID
     *
     * @param uuid UUID of the desired Runtime Policy.
     */
	getOneRuntimePolicy(uuid: string) {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();

			this.http
				.get(this.config.baseSP + this.config.runtimePolicies + '/' + uuid, {
					headers: headers
				})
				.toPromise()
				.then(response => {
					resolve({
						uuid: response[ 'uuid' ],
						name: response[ 'pld' ][ 'name' ],
						vendor: response[ 'pld' ][ 'vendor' ],
						updatedAt: this.utilsService.formatUTCDate(response[ 'updated_at' ]),
						nsUUID: response[ 'ns_uuid' ],
						nsName: response[ 'pld' ][ 'network_service' ][ 'name' ],
						nsVendor: response[ 'pld' ][ 'network_service' ][ 'vendor' ],
						nsVersion: response[ 'pld' ][ 'network_service' ][ 'version' ],
						version: response[ 'pld' ][ 'version' ],
						default: response[ 'default_policy' ],
						enforced: response[ 'enforced' ] ? 'Yes' : 'No',
						sla: response[ 'sla_id' ],
						policyRules: [],
						monitoringRules: []
					});
				})
				.catch(err =>
					reject('There was an error while loading the policy information')
				);
		});
	}

	/**
     * Generates a Runtime Policy
     *
     * @param policy Data of the desired Runtime Policy
     */
	postOneRuntimePolicy(policy): any {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();

			this.http
				.post(this.config.baseSP + this.config.runtimePolicies, policy, {
					headers: headers
				})
				.toPromise()
				.then(response => {
					resolve();
				})
				.catch(err => reject(err.statusText));
		});
	}

	/**
     * Sets a Runtime Policy as default
     *
     * @param uuid UUID of the desired Runtime Policy
     * @param defaultPolicy Boolean setting the binding with its ns
     * @param nsid UUID of the desired NS
     */
	setDefaultRuntimePolicy(uuid, defaultPolicy, nsid) {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();

			const data = {
				defaultPolicy,
				nsid
			};

			this.http
				.patch(
					this.config.baseSP + this.config.runtimePoliciesDefault + uuid,
					data,
					{
						headers: headers
					}
				)
				.toPromise()
				.then(response => {
					if (response[ 'code' ] === 'INVALID') {
						reject('There was an error setting the policy as default!');
					}
					resolve(response);
				})
				.catch(err =>
					reject('There was an error setting the policy as default!')
				);
		});
	}

	/**
     * Binds a Runtime Policy to an SLA
     *
     * @param uuid UUID of the desired Runtime Policy
     * @param slaid UUID of the desired SLA
     * @param nsid UUID of the desired NS
     */
	bindRuntimePolicy(uuid, slaid, nsid) {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();

			const data = {
				slaid,
				nsid
			};

			this.http
				.patch(
					this.config.baseSP + this.config.runtimePoliciesBind + uuid,
					data,
					{
						headers: headers
					}
				)
				.toPromise()
				.then(response => {
					if (response[ 'code' ] === 'INVALID') {
						reject('There was an error binding the sla!');
					}
					resolve(response);
				})
				.catch(err => reject('There was an error binding the sla!'));
		});
	}

	/**
     * Removes the specified runtime policy from the database
     *
     * @param uuid UUID of the desired Runtime Policy.
     */
	deleteOneRuntimePolicy(uuid: string): any {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();

			this.http
				.delete(this.config.baseSP + this.config.runtimePolicies + '/' + uuid, {
					headers: headers,
					responseType: 'text'
				})
				.toPromise()
				.then(response => {
					resolve(JSON.parse(response));
				})
				.catch(err => {
					reject('There was an error while deleting the policy!');
				});
		});
	}

	/**
     * Retrieves a list of Generated Actions.
     * Either following a search pattern or not.
     *
     * @param search [Optional] Actions attributes that must be
     *                          matched by the returned list of
     *                          Generated Actions.
     */
	getGeneratedActions(search?): any {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();
			const url =
				search !== undefined
					? this.config.baseSP + this.config.runtimePoliciesActions + search
					: this.config.baseSP + this.config.runtimePoliciesActions;

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
									correlationUUID: item.correlation_id,
									vnfName: item.action[ 'vnf_name' ],
									scalingType: item.action[ 'scaling_type' ],
									serviceInstanceUUID: item.action[ 'service_instance_id' ],
									value: item.action[ 'value' ],
									date: item.inDateTime
								};
							})
						);
					} else {
						reject('There was an error while fetching the generated actions');
					}
				})
				.catch(err =>
					reject('There was an error while fetching the generated actions')
				);
		});
	}

	/**
     * Retrieves a list of Slices Templates.
     * Either following a search pattern or not.
     *
     * @param search [Optional] Template attributes that must be
     *                          matched by the returned list of
     *                          Slices Templates.
     */
	async getSlicesTemplates(search?) {
		const headers = this.authService.getAuthHeaders();
		const url = search ? this.config.baseSP + this.config.slicesTemplates + search :
			this.config.baseSP + this.config.slicesTemplates;

		try {
			const response = await this.http.get(url, { headers: headers }).toPromise();
			return response instanceof Array ?
				response.map(item => {
					return {
						uuid: item.uuid,
						name: item.nstd.name,
						version: item.nstd.version,
						vendor: item.nstd.vendor,
						usageState: item.nstd.usageState,
						author: item.nstd.author,
						status: item.status
					};
				}) : [];
		} catch (error) {
			console.error(error);
		}
	}

	/**
     * Retrieves a Slices Template by UUID
     *
     * @param uuid UUID of the desired Slices Template.
     */
	async getOneSliceTemplate(uuid) {
		const headers = this.authService.getAuthHeaders();
		const url = this.config.baseSP + this.config.slicesTemplates + '/' + uuid;

		try {
			const response = await this.http.get(url, { headers: headers }).toPromise();
			return {
				uuid: response[ 'uuid' ],
				status: response[ 'status' ],
				name: response[ 'nstd' ][ 'name' ],
				author: response[ 'nstd' ][ 'author' ],
				createdAt: response[ 'created_at' ],
				updatedAt: response[ 'updated_at' ],
				version: response[ 'nstd' ][ 'version' ],
				vendor: response[ 'nstd' ][ 'vendor' ],
				description: response[ 'nstd' ][ 'description' ],
				notificationType: response[ 'nstd' ][ 'notificationTypes' ],
				userDefinedData: response[ 'nstd' ][ 'userDefinedData' ],
				usageState: response[ 'nstd' ][ 'usageState' ],
				onboardingState: response[ 'nstd' ][ 'onboardingState' ],
				operationalState: response[ 'nstd' ][ 'operationalState' ],
				sliceServices: response[ 'nstd' ][ 'sliceServices' ]
			};
		} catch (error) {
			console.error(error);
		}
	}

	/**
     * Creates a Slice Template
     *
     * @param template Data of the new slice template
     */
	async postOneSliceTemplate(template) {
		const headers = this.authService.getAuthHeaders();
		const url = this.config.baseSP + this.config.slicesTemplates;

		try {
			return await this.http.post(url, template, { headers: headers }).toPromise();
		} catch (error) {
			console.error(error);
		}
	}

	/**
     * Removes the specified template from the database
     *
     * @param uuid UUID of the desired Slices Template.
     */
	async deleteOneSlicesTemplate(uuid: string) {
		const headers = this.authService.getAuthHeaders();
		const url = this.config.baseSP + this.config.slicesTemplates + '/' + uuid;

		try {
			return await this.http.delete(url, { headers: headers, responseType: 'text' }).toPromise();
		} catch (error) {
			console.error(error);
		}
	}

	/**
     * Retrieves a list of Slices Instances.
     * Either following a search pattern or not.
     *
     * @param search [Optional] Instances attributes that must be
     *                          matched by the returned list of
     *                          Slices instances.
     */
	async getSlicesInstances(search?) {
		const headers = this.authService.getAuthHeaders();
		const url = search !== undefined ?
			this.config.baseSP + this.config.slicesInstances + search :
			this.config.baseSP + this.config.slicesInstances;

		try {
			const response = await this.http.get(url, { headers: headers }).toPromise();
			return response instanceof Array ?
				response.map(item => {
					return {
						uuid: item.uuid,
						name: item.name,
						vendor: item.vendor,
						template: item[ 'nst-name' ],
						state: item[ 'nsi-status' ]
					};
				}) : [];
		} catch (error) {
			console.error(error);
		}
	}

	/**
     * Retrieves a Slices Instances by UUID
     *
     * @param uuid UUID of the desired Slices Instance.
     */
	getOneSliceInstance(uuid): any {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();

			this.http
				.get(this.config.baseSP + this.config.slicesInstances + '/' + uuid, {
					headers: headers
				})
				.toPromise()
				.then(response => {
					resolve({
						uuid: response[ 'uuid' ],
						name: response[ 'name' ],
						vendor: response[ 'vendor' ],
						state: this.utilsService.capitalizeFirstLetter(response[ 'nsiState' ]),
						description: response[ 'description' ],
						netServInstanceUUID: response[ 'netServInstance_Uuid' ],
						nstName: response[ 'nstName' ],
						version: response[ 'nstVersion' ]
					});
				})
				.catch(err => reject('There was an error fetching the slice instance'));
		});
	}

	/**
     * Generates a Slice Instance
     *
     * @param instance Data of the desired Slice Instance.
     */
	async postOneSliceInstance(instance) {
		const headers = this.authService.getAuthHeaders();
		const url = this.config.baseSP + this.config.requests;
		
		try {
			return await this.http.post(url, instance, { headers: headers	}).toPromise();
		} catch (error) {
			console.error(error);
		}
	}

	/**
     * Terminates a Slice Instance by UUID
     *
     * @param uuid UUID of the desired Slices Instance.
     */
	async postOneSliceInstanceTermination(uuid) {
		const headers = this.authService.getAuthHeaders();
		const url = this.config.baseSP + this.config.slicesInstances + '/' + uuid + '/terminate';
		const terminateTime = {
			terminateTime: '0'
		};

		try {
			return await this.http.post(url, terminateTime, { headers: headers }).toPromise();
		} catch (error) {
			console.error(error);
		}


	}
}
