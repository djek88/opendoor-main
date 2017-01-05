/*
Template Name: Color Admin - Responsive Admin Dashboard Template build with Twitter Bootstrap 3.3.5
Version: 1.9.0
Author: Sean Ngu
Website: http://www.seantheme.com/color-admin-v1.9/admin/
*/

var handleFormWysihtml5 = function () {
	"use strict";
	$('#wysihtml5').wysihtml5();
};

var FormWysihtml5 = function () {
	"use strict";
    return {
        //main function
        init: function () {
            $.getScript('assets/plugins/bootstrap-wysihtml5/lib/js/wysihtml5-0.3.0.js').done(function() {
                $.getScript('assets/plugins/bootstrap-wysihtml5/src/bootstrap-wysihtml5.js').done(function() {
                    handleFormWysihtml5();
                });
            });
        }
    };
}();