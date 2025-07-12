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
Doc reviewed 20250711
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

import thePlatformsReport from '../Reports/PlatformsReport.js';
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
	 * an object with the new values for tag when an automatic update with JOSM is possible
	 * @type {Object}
	 */

	#newTagValues = {
	};

	/**
	 * Add the errors to the report for the currently validated platform
	 */

	#addErrors ( ) {
		if ( 0 === this.#errorsArray.length ) {

			// nothing to report
			return;
		}
		thePlatformsReport.add (
			'h2',
			'Platform ' + this.#osmPlatform.name,
			this.#osmPlatform,
			this.#newTagValues
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

		// A name operator exists on the osm side...
		// Some strange chars in the name... and also double white spaces
		const gtfsNameOperator = this.#gtfsPlatform.nameOperator.replaceAll ( '´', '\'' ).replaceAll ( '  ', ' ' );

		if ( this.#osmPlatform.nameOperator ) {
			const osmNameOperator = this.#osmPlatform.nameOperator.replaceAll ( '´', '\'' );

			// Compare osm name:operator with gffs name:operator
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
		else if

		// no name operator exists on the osm side
		// Compare the osm name with the gtfs name operator using fr as locale and
		// ignoring the casing and punctuation
		( 0 !== this.#osmPlatform.name.localeCompare (
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

			// multiple ref in the platform.description... to complex to verify the network...
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

		// gtfs and osm networks can contains multiple networks...
		// gtfs networks are coming from the gtfs data and then are supposed to be correct
		// so osm networks must contains the gtfs networks, but can also contains networks from other operators
		const osmNetworks = this.#osmPlatform.network ? this.#osmPlatform.network.split ( ';' ) : [];
		const othersOsmNetworks = [];

		// loop on the gtfs networks. We add an error when a gtfs network is not found in the osm networks
		gtfsNetworks.forEach (
			gtfsNetwork => {
				if ( -1 === osmNetworks.indexOf ( gtfsNetwork ) ) {
					haveErrors = true;
				}
			}
		);

		// loop on the osm networks. We add an error when an osm network is not present in the gtfs networks
		// and this osm network is a network of the operator. If the osm network is not a network of the operator,
		// we add this osm network to the list of others osm networks
		osmNetworks.forEach (
			osmNetwork => {
				if ( -1 === gtfsNetworks.indexOf ( osmNetwork ) ) {

					if ( -1 === this.#operatorNetworks.indexOf ( osmNetwork ) ) {
						othersOsmNetworks.push ( osmNetwork );
					}
					else {
						haveErrors = true;
					}
				}
			}
		);

		if ( haveErrors ) {

			// Errors found. we create a list of expected networks with the gtfs networks and others osm networks
			const expectedNetworks =
                gtfsNetworks.concat ( othersOsmNetworks )
                	.sort ( ( first, second ) => first.localeCompare ( second ) )
                	.toString ( )
                	.replaceAll ( ',', ';' );

			// reporting the error
			this.#errorsArray.push (
				{
					htmlTag : 'p',
					text : 'Invalid network:' + this.#osmPlatform.network + ': Expected : ' + expectedNetworks
				}
			);
			theStatsReport.addPlatformsErrorNetwork ( );

			// and adding this value to the list of tags to change with josm
			this.#newTagValues.network = expectedNetworks;

		}
	}

	/**
	 * Validate the operator
	 */

	#validateOperator ( ) {

		// osm can have multiple operators. Creating a list of osm operators
		const operators = this.#osmPlatform.operator ? this.#osmPlatform.operator.split ( ';' ) : [];
		if ( -1 === operators.indexOf ( theOperator.operator ) ) {

			// the operator is not found in the list of osm operators. Reporting an error
			this.#errorsArray.push (
				{
					htmlTag : 'p',
					text : 'The operator tag (' + this.#osmPlatform.operator + ') dont contains ' + theOperator.operator
				}
			);
			theStatsReport.addPlatformsErrorOperator ( );

			// adding the operator to the list of osm operators and to the list of tags to change with josm
			this.#newTagValues.operator =
				this.#osmPlatform.operator
					?
					this.#osmPlatform.operator
						.split ( ';' )
						.concat ( [ theOperator.operator ] )
						.sort ( ( first, second ) => first.localeCompare ( second ) )
						.toString ( )
						.replaceAll ( ',', ';' )
					:
					theOperator.operator;
		}
	}

	/**
	 * Validate the route_ref:network
	 */

	#validateRouteRefs ( ) {
		if ( this.#platformWithMoreThan1Ref ) {

			// multiple ref in the platform.description... to complex to verify the network...
			this.#errorsArray.push (
				{
					htmlTag : 'p',
					text : 'This platform have multiple ref:' + theOperator.operator +
						'* in osm. Not possible to control the route_ref:' + theOperator.operator + '* tags'
				}
			);
			return;
		}

		// gtfs route refs are coming from the gtfs files and are computed for all the operator networks
		// when gtfs data are loaded in the mysql database, so they are supposed correct.

		// loop on the operator networks
		theOperator.networks.forEach (
			network => {

				// gtfs route ref and osm route ref are differnt for the network. Reportinng an errpr
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

					// adding the route ref to the list of tags to change with JOSM
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
	 * @param {Platform} osmPlatform The osm platform to validate
	 * @param {Platform} gtfsPlatform The gtfs platform corresponding to the osm platform
	 */

	validate ( osmPlatform, gtfsPlatform ) {

		// init the validator
 		this.#osmPlatform = osmPlatform;
		this.#gtfsPlatform = gtfsPlatform;
		this.#platformWithMoreThan1Ref = theOsmPlatforms.platformsWithMore1ref.get ( this.#osmPlatform.osmId );
		this.#errorsArray = [];
		this.#newTagValues = {};

		// validation
		this.#validateName ( );
		this.#validateFixme ( );
		this.#validateNetwork ( );
		this.#validateOperator ( );
		this.#validateRouteRefs ( );
		this.#validateZone ( );

		// Reporting the errors
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