# OsmGtfsCompare

This application checks the data entered into OSM for a bus network and compares this network with the contents of the GTFS files.

Select a network, a vehicle and a type ("proposed" is only for TECL) and click an the go btton.
Wait till the red animation stop.

## Using JOSM with OsmGtfsCompare

In the report, a "JOSM" button is added for each osm object. When clicked, the osm object is loaded in the JOSM editor in a new layer or in the current layer, depending of the state of the 'new JOSM layer checkbox'.

Notice: JOSM must be opened before using this button and the remote control activated. See: https://josm.openstreetmap.de/wiki/Help/Preferences/RemoteControl

## gpx files

For each bus route relation, a "Download gpx" button is added. So, youcan download a gpx trace of the bus, included the bus_stop positions and the bus_stop order.

## Validation errors and how to solve

First use your brain.

### Error M001: Route wihout route_master ...

A route is not attached to a route_master. Search or create the route_master and add the route.
It's important to fix this error first because routes without route_master are not longer controlled.

<!--
### Error M003: a relation member of the route_master is not a bus/tram/subway relation

A relation is present in the route_master but it's not a bus/tram/subway route. Verify the tags of this bad relation or remove it from the route_master

### Error M004: a member of the route master is not a relation

A way or a node is found as member of the route_master. Remove it from the route_master
-->

### Error M005: route_master without ref tag 

A route_master without ref tag is found.Add the ref tag

### Error M006: ref tag of the route master (...) is not the same than the ref tag of the route (...)

Verify the ref tag of the route and on the route master

### Error M007: invalid name for route_master (must be ...) ...

The name must be 'Bus ' or 'Tram ' or 'Subway' + the value of the ref tag

### Error M008: no name tag for route_master

Add a name tag

### Error M009: the osm description of the route_master (...) is not equal to the GTFS route long name (...)

Add or correct the description tag. When more than one route_master heve the same ref, teh description is used to link the route_master 
with the GTFS data (see route_master ref 63 for the TECX network or ref 1 or 2 for TECH network...)

### Error M010: An unknown osm route master is found: 

A unknown osm route master is found. Verify the network, ref and description tags of the route master

### Error M011: Oprator tag not found

Add an operator tag

### Error M012: Missing operator:...

The operator tag don't include the current operator. Add the operator to the tag.

### Error R001: hole found for route ... between way id ... and way id ...

A hole is found in the ways of the bus/tram/subway route. Verify the order of the ways and verify if a way is not missing.

### Error R002: a from tag is not found for route ...

A from tag is missing. Add the tag to the bus/tram/subway route

### Error R003: the from tag is not equal to the name of the first platform for route...

The from tag must be equal to the name of the first platform. Correct the from tag.
If the platform is shared between 2 operators and have a different name for each operator the name:operator 
is also valid

### Error R004: a to tag is not found for route ...

A to tag is missing. Add the tag to the bus route

### Error R005: the to tag is not equal to the name of the last platform for route ...

The to tag must be equal to the name of the last platform. Correct the to tag.
If the platform is shared between 2 operators and have a different name for each operator the name:operator 
is also valid

### Error R006: invalid name for route ...

The name of a route must be 'Bus ' + the ref tag of the route + ': ' + the from tag of the route + ' → ' + the to tag of the route

<!--
### Error R008: an unordered object with a role ... is found in the ways of route ...

Reorder the objects in the bus route. Platform and stop must be before the ways in the route relation

### Error R009: an invalid node ... is used as platform for the route ...

The node used as platform don't have a highway=bus_stop tag. Correct the node or remove it from the bus route

### Error R010: an invalid way ... is used as platform for the route ... 

The way used as platform don't have a highway=platform tag . Correct the way or remove it from the bus route

### Error R011: an invalid node ... is used as stop_position for the route ...

The node used as stop_position don't have a public_transport=stop_position tag. Correct the node or remove it from the bus route

### Error R012: an invalid object ... is used as stop_position for the route ...

A way or a relation is used as stop_position. A stop_position must be a node
-->

### Error R013: an invalid highway ... is used as way for the route ...

This kind of way is normally not for motor vehicle (It's a footway, a cycleway, a pedestrian ...) Correct the way (change the highway tag) or add a bus=yes or a psv=yes tag.

### Error R014: an invalid railway ... is used as way for the route ...

Each way object of a tram route must have a tag railway=tram. Each way object of a subway route must have a tag railway=subway. Correct the way.

<!--
### Error R015: an invalid object ... is used as way for the route ...

A node or a relation is used as way for the bus route. Verify the role of the object (bus_stop or stop_position without role) or remove the object from the bus route

### Error R016: an unknow role ... is found in the route ... for the osm object ... 

The role is not a valid role for a bus/tram/subway relation. Verify the role or remove the object. Valid roles are 'platform', 'platform_entry_only', 'platform_exit_only', 'stop', 'stop_entry_only' and 'stop_exit_only'
-->

### Warning R017: A road under construction ...  is used as way for the route

Nothing to do... only a warning.

<!--
### Error R018: route with more than one route_master

A route is attached to more than one route_master. Correct the route_masters and probably remove one of the route_master
-->

### Warning R019: a fixme exists for this relation ...

Try to correct the fixme

### Error R020: a ref tag is not found for route

Add a ref tag

### Error R021: a name tag is not found for route

Add a name tag

### Error R022: Oprator tag not found

Add an operator tag

### Error R023: Missing operator:...

The operator tag don't include the current operator. Add the operator to the tag.

<!--
### Error T001: The value of the tag ... must be one of ... (found ...)

Correct the value of the tag

### Error T002: The value of the tag ... must include ... (found ...)

Correct the value of the tag

### Error T003: The value of the tag ... must be ... (found ...)

Correct the value of the tag

### Error T004: No tag ...

A tag is missing for a route or a route_master. Add the tag

-->

## GTFS comparison errors and how to solve

__It's better that all the validation errors will be fixed before starting to fix the GTFS comparison errors__.

For each OSM bus route, the apps search a similar GTFS route, comparing the bus_stop between OSM and GTFS.

First the apps search a GTFS route with the same bus_stop than in the OSM route and in the same order. 

If found, the GTFS route is displayed in the report with a green bullet 🟢 and the apps stop to search

If not found, the apps search all the GTFS route having the same starting bus_stop and the same ending bus_stop.

If found the GTFS routes are displayed in the report with a blue bullet 🔵 and with a list of bus stop to add and a list 
of bus_stop to remove.

If not found, the apps search all the GTFS route having a similar starting bus_stop and a similar ending bus_stop (similar will say that the ref:TEC... are the same in the OSM bus_stop and GTFS bus_stop, except the last character).

If found, the GTFS routes is displayed in the report with a yellow bullet 🟡 and with a list of bus stop to add and a list 
of bus_stop to remove.

If not found, a error is diplayed with a red bullet "No gtfs route found 🔴"

And finally a list of all GTFS routes that cannot be linked to an OSM route is displayed
- with a red bullet 🔴
- with a purple bullet 🟣 when the GTFS route is a part of a already existing OSM route. In that case a list of the OSM routes is also displayed.
- with a ⚫ when the validity end date of the GTFS route is in the past
- with a ⚪ when the validity start date of the GTFS route is in the future

When all osm route_master and routes are linked and displayed , a list of the GTFS route_master not linked to an osm_route_master is displayed.

__Be carefull before deleting an OSM route that seems not linked to a GTFS route, especially for school bus! Verify and compare!__

__Fixing the comparison errors is not easy, so first use your brain, then use your brain and finally use your brain!__

Good luck




