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
Doc reviewed 20250711
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

/* eslint-disable no-unused-vars */

/**
 * This class represent an osm node. Only for documentation purposes
 */

class OsmObject {

	/**
     * The osm unique id
     * @type {Number}
     */

	id = 0;

	/**
     * The osm type of the object ( must be node, way or relation)
     * @type {Number}
     */

	/**
     * The constructor
     */

	constructor ( ) {
	}
}

/**
 * This class represent an osm node. Only for documentation purposes
 */

class OsmNode extends OsmObject {

	/**
     * The osm type of the object ( must be node, way or relation)
     * @type {Number}
     */

	type = 'node';

	/**
     * The constructor
     */

	constructor ( ) {
	}
}

/**
 * This class represent an osm way. Only for documentation purposes
 */

class OsmWay extends OsmObject {

	/**
     * The osm type of the object ( must be node, way or relation)
     * @type {Number}
     */

	type = 'way';

	/**
     * The constructor
     */

	constructor ( ) {
	}
}

/**
 * This class represent an osm member. Only for documentation purposes
 */

class OsmMember extends OsmObject {

	/**
     * The constructor
     */

	constructor ( ) {
	}

}

/**
 * This class represent an osm route. Only for documentation purposes
 */

class OsmRoute extends OsmObject {

	/**
     * The osm type of the object ( must be node, way or relation)
     * @type {Number}
     */

	type = 'relation';

	/**
     * The members of the route
     * @type {Array.<OsmElement>}
     */

	members = [];

	/**
     * The tags of the route master
     * @type {Object}
     */

	tags = {
		type : 'route'
	};

	/**
     * The constructor
     */

	constructor ( ) {
	};
}

/**
 * This class represent an osm route master relation. Only for documentation purposes
 */

class OsmRouteMaster extends OsmObject {

	/**
     * The osm type of the object ( must be node, way or relation)
     * @type {Number}
     */

	type = 'relation';

	/**
     * The members of the route master
     * @type {Array.<OsmElement>}
     */

	members = [];

	/**
     * The tags of the route master
     * @type {Object}
     */

	tags = {
		type : 'route_master'
	};

	/**
     * The constructor
     */

	constructor ( ) {
	};
}