/*
Copyright - 2024 2025 - wwwouaiebe - Contact: https://www.ouaie.be/

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

import theRelationsReport from '../Reports/RelationsReport.js';
import theDocConfig from '../interface/DocConfig.js';
import theOsmDataLoader from '../DataLoading/OsmDataLoader.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Validator for the roles
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class OsmRolesValidator {

	/**
     * A counter for the errors
     * @type {Number}
     */

	#haveErrors = false;

 	/**
	 * The route currently controlled
	 * @type {Object}
	 */

	#osmRoute;

	/**
	 * the ways associated to the route (= members without role but having an highway tag
	 * for bus or a railway tag for tram and subway)
	 * @type {Array}
	 */

	#ways;

	/**
	 * Verify the position of the objects with a role. The objects with a role
	 * must be at the top of the relation and the objects without role at the end
	 */

	#validateRolesOrder ( ) {
		let emptyRole = false;
		this.#osmRoute.members.forEach (
			member => {
				if ( '' === member.role && ! emptyRole ) {
					emptyRole = true;
				}
				else if ( emptyRole && '' !== member.role ) {
					theRelationsReport.add (
						'p',
						'Error R008: an unordered object with a role (' + theRelationsReport.getOsmLink ( member.ref ) +
                        ') is found in the ways of route '
					);
					this.#haveErrors = true;
				}
			}
		);
	}

	/**
	 * Verify that, for objects having a 'platform' role:
	 * - the platform have an highway='bus_stop' tag when the platform is a node
	 * - the platform have an highway='platform' tag when the plaform is a way and the vehicle is a bus
	 * - the platform have an railway='platform' tag when the plaform is a way and the vehicle is a tram or subway
	 * - note: role can be platform, platform_entry_only or platform_exit_only
    @param { Object } member The osm member with the 'platform' role
	 */

	#validatePlatformRole ( member ) {
		if ( 'node' === member.type ) {
			const busStop = theOsmDataLoader.getNode ( member.ref );
			if ( 'bus_stop' !== busStop?.tags?.highway ) {
				theRelationsReport.add (
					'p',
					'Error R009: an invalid node (' + theRelationsReport.getOsmLink ( busStop ) +
						') is used as platform for the route'
				);
				this.#haveErrors = true;
			}
		}
		if ( 'way' === member.type ) {
			const platform = theOsmDataLoader.getWay ( member.ref );
			if (
				( 'platform' !== platform?.tags?.highway && 'bus' === theDocConfig.vehicle )
				||
				( 'platform' !== platform?.tags?.railway && 'tram' === theDocConfig.vehicle )
			) {
				theRelationsReport.add (
					'p',
					'Error R010: an invalid way (' + theRelationsReport.getOsmLink ( platform ) +
						') is used as platform for the route'
				);
				this.#haveErrors = true;
			}
		}
	}

	/**
	 * Verify that, for objects having a 'stop' role the member
     * @param { Object } member The osm member with the 'stop' role
	 */

	#validateStopRole ( member ) {
		if ( 'node' === member.type ) {
			const stopPosition = theOsmDataLoader.getNode ( member.ref );
			if (
				'stop_position' !== stopPosition?.tags?.public_transport
			) {
				theRelationsReport.add (
					'p',
					'Error R011: an invalid node (' + theRelationsReport.getOsmLink ( stopPosition ) +
						') is used as stop_position for the route'
				);
				this.#haveErrors = true;
			}
		}
		else {
			theRelationsReport.add (
				'p',
				'Error R012: an invalid object (' + theRelationsReport.getOsmLink ( member ) +
					') is used as stop_position for the route'
			);
			this.#haveErrors = true;
		}
	}

	/**
	 * Verify that a way is a valid way for a bus:
	 * - the highway tag of way is in the validBusHighways array
	 * - or the way have a bus=yes tag or psv=yes tag
	 * @param {Object} way The way to verify
	 */

	#validateWayForBus ( way ) {
		const validBusHighways =
		[
			'motorway',
			'motorway_link',
			'trunk',
			'trunk_link',
			'primary',
			'primary_link',
			'secondary',
			'secondary_link',
			'tertiary',
			'tertiary_link',
			'service',
			'residential',
			'unclassified',
			'living_street',
			'busway',
			'construction'
		];

		if ( 'construction' === way?.tags?.highway ) {
			theRelationsReport.add (
				'p',
				'Warning R017: a road under construction (' + theRelationsReport.getOsmLink ( way ) +
				') is used as way for the route'
			);
			this.#haveErrors = true;
		}
		if (
			-1 === validBusHighways.indexOf ( way?.tags?.highway )
			&&
			'yes' !== way?.tags?.psv
			&&
			'yes' !== way?.tags [ theDocConfig.vehicle ]
	   ) {
		   theRelationsReport.add (
				'p',
				'Error R013: an invalid highway (' + theRelationsReport.getOsmLink ( way ) +
				') is used as way for the route'
		   );
		   this.#haveErrors = true;
	   }
	}

	/**
	 * Verify that a way is valid for a tram:
	 * - the way must have a railway=tram tag
	 * @param {Object} way The way to verify
	 */

	#validateWayForTram ( way ) {
		if ( 'tram' !== way?.tags?.railway ) {
			theRelationsReport.add (
				'p',
				'Error R014: an invalid railway (' + theRelationsReport.getOsmLink ( way ) +
				') is used as way for the route'
			);
			this.#haveErrors = true;
		}

	}

	/**
	 * Verify that a way is valid for a subway:
	 * - the way must have a railway=subway tag
	 * @param {Object} way The way to verify
	 */

	#validateWayForSubway ( way ) {
		if ( 'subway' !== way?.tags?.railway ) {
			theRelationsReport.add (
				'p',
				'Error R014: an invalid railway (' + theRelationsReport.getOsmLink ( way ) +
				') is used as way for the route'
			);
			this.#haveErrors = true;
		}
	}

	/**
	* Verify that a way is a valid way for an empty role
    @param { Object } member the member to verify
	 */

	#validateWayRole ( member ) {
		const way = theOsmDataLoader.getWay ( member.ref );
		if ( 'way' === member.type ) {
			switch ( theDocConfig.vehicle ) {
			case 'bus' :
				this.#validateWayForBus ( way );
				break;
			case 'tram' :
				this.#validateWayForTram ( way );
				break;
			case 'subway' :
				this.#validateWayForSubway ( way );
				break;
			default :
				break;
			}
		}
		else {
			theRelationsReport.add (
				'p',
				'Error R015: an invalid object (' + theRelationsReport.getOsmLink ( member ) +
					') is used as way for the route'
			);
			this.#haveErrors = true;
		}
	}

	/**
	 * Verify that all the members of the route relation have a valid role
	 * and can be used for this role
	 */

	#validateRolesObjects ( ) {
		this.#osmRoute.members.forEach (
			member => {
				switch ( member.role ) {
				case 'platform' :
				case 'platform_entry_only' :
				case 'platform_exit_only' :
					this.#validatePlatformRole ( member );
					break;
				case 'stop' :
				case 'stop_entry_only' :
				case 'stop_exit_only' :
					this.#validateStopRole ( member );
					break;
				case '' :
					this.#validateWayRole ( member );
					break;
				default :
					theRelationsReport.add (
						'p',
						'Error R016: an unknow role (' + member.role +
                            ') is found in the route for the osm object ' + theRelationsReport.getOsmLink ( member )
					);
					this.#haveErrors = true;
					break;
				}
			}
		);
	}

	/**
     * Start the validation
     */

	validate ( ) {
		this.#validateRolesObjects ( );
		this.#validateRolesOrder ( );
		return this.#haveErrors;
	}

	/**
	 * The constructor
	 * @param {Object} osmRoute The controlled route
	 */

	constructor ( osmRoute ) {
		this.#osmRoute = osmRoute;
		Object.freeze ( this );
	}
}

export default OsmRolesValidator;

/* --- End of file --------------------------------------------------------------------------------------------------------- */