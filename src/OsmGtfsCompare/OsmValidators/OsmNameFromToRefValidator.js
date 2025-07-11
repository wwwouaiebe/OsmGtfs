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
Doc reviewed 20250126
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

import theOsmDataLoader from '../DataLoading/OsmDataLoader.js';
import theRelationsReport from '../Reports/RelationsReport.js';
import theDocConfig from '../interface/DocConfig.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Validator for the name, from, ref and to tags
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class OsmNameFromToRefValidator {

	/**
     * A counter for the errors
     * @type {Number}
     */

	#haveErrors = false;

	/**
	 * The route currently controlled
	 * @type {Object}
	 */

	#osmRoute = null;

	/**
	 * the from platform ( = the first platform of the route)
	 * @type {Object}
	 */

	#fromPlatform = null;

	/**
	 * the from platform ( = the last platform of the route)
	 * @type {Object}
	 */

	#toPlatform = null;

	/**
	* Validate the from tag. The from tag must be the same than the name of the first platform
	 */

	#validateFrom ( ) {

		if (
			this.#osmRoute?.tags?.from
			&&
			this.#osmRoute?.tags?.from !== this.#fromPlatform?.tags?.name
			&&
			(
				this.#osmRoute?.tags?.from.toLowerCase ( )
				!==
				( this.#fromPlatform?.tags [ 'name:operator:' + this.#osmRoute?.tags?.operator ] ?? '' ).toLowerCase ( )
			)
		) {
			theRelationsReport.add (
				'p',
				'Error R003: the from tag is not equal to the name of the first platform for route '
			);
			this.#haveErrors = true;
		}
	}

	/**
	* Validate the to tag. The to tag must be the same than the name of the last platform
	 */

	#validateTo ( )	{
		if (
			this.#osmRoute?.tags?.to
			&&
			this.#osmRoute?.tags?.to !== this.#toPlatform?.tags?.name
			&&
			(
				this.#osmRoute?.tags?.to.toLowerCase ( )
				!==

				( this.#toPlatform?.tags [ 'name:operator:' + this.#osmRoute?.tags?.operator ] ?? '' ).toLowerCase ( )
			)
		) {
			theRelationsReport.add (
				'p',
				'Error R005: the to tag is not equal to the name of the last platform for route'
			);
			this.#haveErrors = true;
		}
	}

	/**
	* Verify that the route have a from tag, a to tag, a name tag and a ref tag
	 */

	#haveTagsNameFromToRef ( ) {
		const haveTagsNameFromToRef =
			this.#osmRoute?.tags?.from && this.#osmRoute?.tags?.to && this.#osmRoute?.tags?.name && this.#osmRoute?.tags?.ref;

		return haveTagsNameFromToRef;
	}

	/**
	* Verify that the name is compliant with the osm rules
	 */

	#validateName ( ) {
		let vehicle = theDocConfig.vehicle.substring ( 0, 1 ).toUpperCase ( ) +
		theDocConfig.vehicle.substring ( 1 );
		if ( this.#haveTagsNameFromToRef ( ) ) {
			let goodName =
				vehicle + ' ' + this.#osmRoute?.tags?.ref + ': ' +
				this.#osmRoute?.tags?.from + ' → ' + this.#osmRoute?.tags?.to;
			if ( this.#osmRoute?.tags?.name.replaceAll ( '=>', '→' ) !== goodName ) {
				theRelationsReport.add (
					'p',
					'Error R006: Invalid name ("' + this.#osmRoute?.tags?.name + '" but expected "' + goodName + '") for route '
				);
				this.#haveErrors = true;
			}
		}
	}

	/**
	 * Search the first and last platforms of the osm route
	 */

	#loadPlatforms ( ) {
		let fromPlatformOsmId = 0;
		let toPlatformOsmId = 0;
		this.#osmRoute.members.forEach (
			member => {
				if ( 'platform' === member.role ) {
					if ( 0 === fromPlatformOsmId ) {
						toPlatformOsmId = member.ref;
					}
					toPlatformOsmId = member.ref;
				}
			}
		);
		this.#fromPlatform = theOsmDataLoader.getPlatform ( fromPlatformOsmId );
		this.#toPlatform = theOsmDataLoader.getPlatform ( toPlatformOsmId );
	}

	/**
	 * Start the validation of name, from, to and ref tags
	 */

	validate ( ) {

		if ( ! this.#osmRoute?.tags?.from ) {

			// no from tag
			theRelationsReport.add (
				'p',
				'Error R002: a from tag is not found for route'
			);
			this.#haveErrors = true;
		}

		if ( ! this.#osmRoute?.tags?.to ) {

			// no to tag
			theRelationsReport.add (
				'p',
				'Error R004: a to tag is not found for route'
			);
			this.#haveErrors = true;
		}

		if ( ! this.#osmRoute?.tags?.ref ) {

			// no ref tag
			theRelationsReport.add (
				'p',
				'Error R020: a ref tag is not found for route'
			);
			this.#haveErrors = true;
		}

		if ( ! this.#osmRoute?.tags?.name ) {

			// no name tag
			theRelationsReport.add (
				'p',
				'Error R021: a name tag is not found for route'
			);
			this.#haveErrors = true;
		}

		this.#loadPlatforms ( );

		this.#validateFrom ( );
		this.#validateTo ( );
		this.#validateName ( );

		return this.#haveErrors;
	}

	/**
	 * The constructor
	 * @param {Object} osmRoute the route to validate
	 */

	constructor ( osmRoute ) {
		this.#osmRoute = osmRoute;
		Object.freeze ( this );
	}
}

export default OsmNameFromToRefValidator;