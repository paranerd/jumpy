var simpleCollision = function(entity1, entity2) {
		ent1 = entity1.getPos();
		ent2 = entity2.getPos();
	if(	ent1.right >= ent2.left && ent1.left <= ent2.right &&
		ent1.bottom >= ent2.top && ent1.top <= ent2.bottom)
	{
		var bottom_diff = ent2.bottom - ent1.top;
		var top_diff = ent1.bottom - ent2.top;
		var left_diff = ent1.right - ent2.left;
		var right_diff = ent2.right - ent1.left;

		var coll = {bottom: false, right: false, left: false, top: false};
		
		coll.bottom = top_diff < bottom_diff && top_diff < left_diff && top_diff < right_diff;
		coll.right	= left_diff < right_diff && left_diff < top_diff && left_diff < bottom_diff;
		coll.left	= right_diff < left_diff && right_diff < top_diff && right_diff < bottom_diff;
		coll.top	= bottom_diff < top_diff && bottom_diff < left_diff && bottom_diff < right_diff;

		return coll;
	}
	return false;
}

var simpleCollision2 = function(entity1, entity2) {
		ent1 = entity1.getPos();
		ent2 = entity2.getPos();
	if(	((ent1.left >= ent2.left && ent1.left <= ent2.right) ||
		(ent1.right <= ent2.right && ent1.right >= ent2.left)) &&
		((ent1.top >= ent2.top && ent1.top <= ent2.bottom) ||
		(ent1.bottom <= ent2.bottom && ent1.bottom >= ent2.top)))
	{
		var b_collision = ent2.bottom - ent1.top;
		var t_collision = ent1.bottom - ent2.top;
		var l_collision = ent1.right - ent2.left;
		var r_collision = ent2.right - ent1.left;

		var coll = {bottom: false, right: false, left: false, top: false};

		if (t_collision < b_collision && t_collision < l_collision && t_collision < r_collision ) {
			coll.bottom = true;
		}
		if (l_collision < r_collision && l_collision < t_collision && l_collision < b_collision) {
			coll.right = true;
		}
		if (r_collision < l_collision && r_collision < t_collision && r_collision < b_collision ) {
			coll.left = true;
		}
		if (b_collision < t_collision && b_collision < l_collision && b_collision < r_collision) {
			coll.top = true;
		}
		return coll;
	}
	return false;
}

var simpleCollision3 = function(entity1, entity2) {
	ent1 = entity1.getPos();
	ent2 = entity2.getPos();

	if(	ent1.right >= ent2.left && ent1.left <= ent2.right &&
		ent1.bottom >= ent2.top && ent1.top <= ent2.bottom)
	{
		var top_diff = ent2.bottom - ent1.top;
		var bottom_diff = ent1.bottom - ent2.top;
		var right_diff = ent1.right - ent2.left;
		var left_diff = ent2.right - ent1.left;
		var min = Math.min(bottom_diff, top_diff, left_diff, right_diff);
		
		var coll = {bottom: (bottom_diff == min), right: (right_diff == min), left: (left_diff == min), top: (top_diff == min)};
		
		return coll;
	}
	return false;
}

var predColl = function(entity1, entity2, delta) {
	var ent1 = entity1.getPos();
	var ent2 = entity2.getPos();
	if(	((ent1.left + (entity1.speedVec.x * delta) >= ent2.left && ent1.left + (entity1.speedVec.x * delta) <= ent2.right) ||
			(ent1.right + (entity1.speed * entity1.lookDir * delta) <= ent2.right && ent1.right + (entity1.speedVec.x * delta) >= ent2.left)) &&
			((ent1.top + entity1.speedVec.y >= ent2.top && ent1.top + entity1.speedVec.y <= ent2.bottom) ||
			(ent1.bottom + entity1.speedVec.y <= ent2.bottom && ent1.bottom + entity1.speedVec.y >= ent2.top)))
	{
		var b_collision = ent2.bottom - ent1.top;
		var t_collision = ent1.bottom - ent2.top;
		var l_collision = ent1.right - ent2.left;
		var r_collision = ent2.right - ent1.left;

		var coll = {bottom: false, right: false, left: false, top: false};

		if (t_collision < b_collision && t_collision < l_collision && t_collision < r_collision ) {
			coll.bottom = true;
		}
		if (l_collision < r_collision && l_collision < t_collision && l_collision < b_collision) {
			coll.right = true;
		}
		if (r_collision < l_collision && r_collision < t_collision && r_collision < b_collision ) {
			coll.left = true;
		}
		if (b_collision < t_collision && b_collision < l_collision && b_collision < r_collision) {
			coll.top = true;
		}
		return coll;
	}
	return false;
}
