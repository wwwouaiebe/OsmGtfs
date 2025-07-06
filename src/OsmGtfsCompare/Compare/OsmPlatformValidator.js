/*
Copyright - 2025 - wwwouaiebe - Contact: https://www.ouaie.be/

This  program is free software;
you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
/*
Changes:
	- v1.0.0:
		- created
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

import thePlatformsReport from '../../OsmGtfsCompare/Reports/PlatformsReport.js';
import theOperator from '../../Common/Operator.js';
import theStatsReport from '../Reports/StatsReport.js';
import theOsmPlatforms from '../DataLoading/OsmPlatforms.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Validator for platforms
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class OsmPlatformValidator {

	/**
	 * A reference to the currently validated platform when this platform have more than 1ref, null otherwise
	 * @type {?Object}
	 */

	#platformWithMoreThan1Ref;

	/**
	 * The currently validated osm platform
	 * @type {Object}
	 */

	#osmPlatform;

	/**
	 * the gtfs platform corresponding to the currently validated osm platform
	 * @type {Object}
	 */

	#gtfsPlatform;

	/**
	 * An array with the networks name linked to the operator
	 * @type {Array.<String>}
	 */

	#operatorNetworks = [];

	/**
	 *  An array with errors founf for the currently validated platform
	 * @type {Array.<Object>}
	 */

	#errorsArray = [];

	/**
	 * an object with the new values for tag when an automatic update is possible
	 * @type {Object}
	 */

	#newTagValues = {
	};

	/**
	 * Add the errors to the report for the currently validated platform
	 */

	#addErrors ( ) {
		if ( 0 === this.#errorsArray.length ) {
			return;
		}
		thePlatformsReport.add (
			'h2',
			'Platform ' + this.#osmPlatform.name,
			{ id : this.#osmPlatform.osmId, type : this.#osmPlatform.osmType, newTagValues : this.#newTagValues }
		);
		this.#errorsArray.forEach (
			tmpError => {
				thePlatformsReport.add ( tmpError.htmlTag, tmpError.text );
			}
		);
	}

	/**
	 * Validate the name and name:operator
	 */

	#validateName ( ) {
		const gtfsNameOperator = this.#gtfsPlatform.nameOperator.replaceAll ( '´', '\'' ).replaceAll ( '  ', ' ' );

		if ( this.#osmPlatform.nameOperator ) {
			const osmNameOperator = this.#osmPlatform.nameOperator.replaceAll ( '´', '\'' );
			if ( 0 !== osmNameOperator.localeCompare ( gtfsNameOperator ) ) {
				this.#errorsArray.push (
					{
						htmlTag : 'p',
						text : 'Invalid name:operator:' + theOperator.operator + ' : ' +
                        this.#osmPlatform.nameOperator + ': Expected : ' + gtfsNameOperator
					}
				);
				theStatsReport.addPlatformsErrorNameOperator ( );
			}
		}
		else if ( 0 !== this.#osmPlatform.name.localeCompare (
			gtfsNameOperator,
			'fr',
			{ sensitivity : 'base', ignorePunctuation : true } )
		) {
			this.#errorsArray.push (
				{
					htmlTag : 'p',
					text : 'Invalid name or missing name:operator:' + theOperator.operator + ' : ' +
                        this.#osmPlatform.name + ' name given by ' + theOperator.operator + ' : ' + gtfsNameOperator
				}
			);
			theStatsReport.addPlatformsErrorName ( );
		}
	}

	/**
	 * Validate the fixme
	 */

	#validateFixme ( ) {
		if ( this.#osmPlatform.fixme ) {
			this.#errorsArray.push (
				{
					htmlTag : 'p',
					text : 'A fixme exists for this platform:' + this.#osmPlatform.fixme
				}
			);
			theStatsReport.addPlatformsWarningFixme ( );
		}
	}

	/**
	 * Validate the network
	 */

	#validateNetwork ( ) {
		if ( this.#platformWithMoreThan1Ref ) {
			this.#errorsArray.push (
				{
					htmlTag : 'p',
					text : 'This platform have multiple ref:' + theOperator.operator +
						'* in osm. Not possible to control the network tag'
				}
			);
			return;
		}

		let haveErrors = false;
		const gtfsNetworks = this.#gtfsPlatform.network.split ( ';' );
		const osmNetworks = this.#osmPlatform.network.split ( ';' );
		const othersNetworks = [];

		gtfsNetworks.forEach (
			gtfsNetwork => {
				if ( -1 === osmNetworks.indexOf ( gtfsNetwork ) ) {
					haveErrors = true;
				}
			}
		);
		osmNetworks.forEach (
			osmNetwork => {
				if ( -1 === gtfsNetworks.indexOf ( osmNetwork ) ) {

					if ( -1 === this.#operatorNetworks.indexOf ( osmNetwork ) ) {
						othersNetworks.push ( osmNetwork );
					}
					else {
						haveErrors = true;
					}
				}
			}
		);

		if ( haveErrors ) {
			let expectedNetworks =
                gtfsNetworks.concat ( othersNetworks )
                	.sort ( ( first, second ) => first.localeCompare ( second ) )
                	.toString ( )
                	.replaceAll ( ',', ';' );

			this.#errorsArray.push (
				{
					htmlTag : 'p',
					text : 'Invalid network:' + this.#osmPlatform.network + ': Expected : ' + expectedNetworks
				}
			);
			theStatsReport.addPlatformsErrorNetwork ( );
			this.#newTagValues.network = expectedNetworks;

		}
	}

	/**
	 * Validate the operator
	 */

	#validateOperator ( ) {
		if ( -1 === this.#osmPlatform.operator.split ( ';' ).indexOf ( theOperator.operator ) ) {
			this.#errorsArray.push (
				{
					htmlTag : 'p',
					text : 'The operator tag (' + this.#osmPlatform.operator + ') dont contains ' + theOperator.operator
				}
			);
			theStatsReport.addPlatformsErrorOperator ( );
			this.#newTagValues.operator =
				this.#osmPlatform.operator
					.split ( ';' )
					.concat ( [ theOperator.operator ] )
					.sort ( ( first, second ) => first.localeCompare ( second ) )
					.toString ( )
					.replaceAll ( ',', ';' );
		}
	}

	/**
	 * Validate the route_ref:network
	 */

	#validateRouteRefs ( ) {
		if ( this.#platformWithMoreThan1Ref ) {
			this.#errorsArray.push (
				{
					htmlTag : 'p',
					text : 'This platform have multiple ref:' + theOperator.operator +
						'* in osm. Not possible to control the route_ref:' + theOperator.operator + '* tags'
				}
			);
			return;
		}
		theOperator.networks.forEach (
			network => {
				if (
					this.#gtfsPlatform.routeRefs [ network.osmNetwork ]
                    !== this.#osmPlatform.routeRefs [ network.osmNetwork ]
				) {
					this.#errorsArray.push (
						{
							htmlTag : 'p',
							text :
                                'Invalid route_ref:' + network.osmNetwork + ': Expected : ' +
                                (
                                	this.#gtfsPlatform.routeRefs [ network.osmNetwork ]
                                		?
                                		this.#gtfsPlatform.routeRefs [ network.osmNetwork ]
                                		:
                                		'nothing'
                                ) +
                                ' but found ' +
                                (
                                	this.#osmPlatform?.routeRefs [ network.osmNetwork ]
                                		?
                                		this.#osmPlatform.routeRefs [ network.osmNetwork ]
                                		:
                                		'nothing'
                                )
						}
					);
					theStatsReport.addPlatformsErrorNetwork ( );

					this.#newTagValues [ 'route_ref:' + network.osmNetwork ] =
						this.#gtfsPlatform.routeRefs [ network.osmNetwork ]
							?
							this.#gtfsPlatform.routeRefs [ network.osmNetwork ]
							:
							'';
				}
			}
		);
	}

	/**
	 * Validate the zone:operator
	 */

	#validateZone ( ) {
		if ( this.#gtfsPlatform.zone !== this.#osmPlatform.zone ) {
			this.#errorsArray.push (
				{
					htmlTag : 'p',
					text :
                        'Invalid zone:' + theOperator.operator + ' Expected : ' +
                        this.#gtfsPlatform.zone + ' but found ' +
                        ( this.#osmPlatform?.zone ? this.#osmPlatform.zone : 'nothing' )
				}
			);
			theStatsReport.addPlatformsErrorZone ( );
			this.#newTagValues [ 'zone:' + theOperator.osmOperator ] = this.#gtfsPlatform.zone;
		}
	}

	/**
	 * Performs the validation of an osm platform
	 * @param {Object} osmPlatform The osm platform to validate
	 * @param {Object} gtfsPlatform The gtfs platform corresponding to the osm platform
	 */

	validate ( osmPlatform, gtfsPlatform ) {
 		this.#osmPlatform = osmPlatform;
		this.#gtfsPlatform = gtfsPlatform;
		this.#platformWithMoreThan1Ref = theOsmPlatforms.platformsWithMore1ref.get ( this.#osmPlatform.osmId );
		this.#errorsArray = [];
		this.#newTagValues = {};
		this.#validateName ( );
		this.#validateFixme ( );
		this.#validateNetwork ( );
		this.#validateOperator ( );
		this.#validateRouteRefs ( );
		this.#validateZone ( );
		this.#addErrors ( );
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		theOperator.networks.forEach (
			network => { this.#operatorNetworks.push ( network.osmNetwork ); }
		);

		Object.freeze ( this );
	}
}

export default OsmPlatformValidator;

/* --- End of file --------------------------------------------------------------------------------------------------------- */