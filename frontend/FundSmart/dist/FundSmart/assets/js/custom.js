
$(document).ready(function () {
    /* user menu */
    $(".user-name a").click(function () {
        $(this).closest(".user-name").find(".user-drop-down").addClass("open-user-sub-menu")
    });

    $("a.close-menu").click(function () {
        $(this).closest(".user-drop-down").removeClass("open-user-sub-menu")
    })
    /* user menu */

    /* Mobile menu */
    $("a.toggle-menu").click(function () {
        $(this).toggleClass("toggle-active");
        $(this).closest("body").find(".custom-sidebar").toggleClass("open-sidebar")
    });
    /* Mobile Menu */

    /* Mobile search */
    $(".mobile-searh a").click(function () {
        $(this).closest("form").find(".input-group").toggleClass("open-search")
    });
    /*Mobile Search */


    /* Holding Summary Tabs*/
    $(document).on('click', '.fund-tabs ul li a', function () {
        var tab_id = $(this).attr('data-tab');
        $(".fund-tabs li").removeClass('active');
        $('.item').removeClass('active');
        $(this).closest("li").addClass('active');
        $("#" + tab_id).addClass('active');
        resetprogressbar();
        progressbar(tab_id);
    });

    if ($(".fund-tab-content .item").hasClass("active")) {
        var currentActiveTab = $(".fund-tab-content .item").attr('id');
        //alert(currentActiveTab)
        resetprogressbar();
        progressbar(currentActiveTab);
    }
    /* Holding Summary Tabs*/

    /* Modal */
    $('.modal').on('show.bs.modal', function () {
        $("html").addClass("modal-open");
    });
    $('.modal').on('hide.bs.modal', function () {
        $("html").removeClass("modal-open");
    });
    /* Modal */

    /* Register slideDown and Forgot Password */
    $(".login-email").click(function () {
        $(this).closest("form").find(".register-slide").slideDown("500");
    });

    $(".forgot-password a").click(function () {
        $(this).closest(".modal-body").find(".forgot-password-wrap").addClass("show-forgot");
        $(this).closest(".modal-body").find(".login-content").addClass("hide-login");
    });
    /* Register slideDown and Forgot Password */

    /* DataTables */
    // var t = $('#security-table').DataTable({
    //   "autoWidth": true,
    //   "scrollY": "600px",
    //   "ScrollX": "100%",
    //   "scrollCollapse": true,
    //   "paging": true,
    //   "fixedHeader": false,
    //   "responsive": true,
    //   "fnInitComplete": function () {
    //     var ps = new PerfectScrollbar('.dataTables_scrollBody');
    //   },
    //   "fnDrawCallback": function (oSettings) {
    //     var ps = new PerfectScrollbar('.dataTables_scrollBody');
    //   }
    // });

    // var t = $('#holding-table').DataTable({
    //   "autoWidth": true,
    //   "scrollY": "600px",
    //   "ScrollX": "100%",
    //   "scrollCollapse": true,
    //   "paging": true,
    //   "fixedHeader": false,
    //   "responsive": true,
    //   "fnInitComplete": function () {
    //     var ps = new PerfectScrollbar('.dataTables_scrollBody');
    //   },
    //   "fnDrawCallback": function (oSettings) {
    //     var ps = new PerfectScrollbar('.dataTables_scrollBody');
    //   }

    // });

    // $('.upload-icon-btn').on( 'click', function () {
    //   t.row.add([
    //     "Security",
    //     "Quantity",
    //     "Quantity",
    //     "Quantity"
    //   ]).draw( false );
    // });
    /* DataTables */

    /* Line chart */
    //   var chart = new Chartist.Line('.ct-chart', {
    //     labels: ['1/1/2019', '2/1/2019', '3/1/2019', '4/1/2019', '5/1/2019', '6/1/2019','7/1/2019'],
    //     series: [
    //       [100,90,70,210,50,140,250],
    //       [100,150,130,70,30,50,150]
    //     ]
    //   },{  
    //     height: '200px',
    //     axisX: {
    //     showGrid: false,
    //     offset: 40
    //   },
    //     axisY: {
    //       showGrid: true,
    //       type: Chartist.FixedScaleAxis,
    //       ticks: [0,50, 100, 150, 200, 250],
    //       low: 0,
    //       high:250
    //     },
    //   },
    //   [
    //     ['screen and (max-width: 1280px)', {
    //         height:'300px'
    //     }],
    //     ['screen and (max-width: 576px)', {
    //       axisX: {
    //         showLabel: false
    //       }
    //     }]
    //   ]
    //   );

    //   // Let's put a sequence number aside so we can use it in the event callbacks
    //   var seq = 0,
    //   delays = 80,
    //   durations = 500;

    //   // Once the chart is fully created we reset the sequence
    //   chart.on('created', function() {
    //     seq = 0;
    //   });

    //   // On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations
    //   chart.on('draw', function(data) {
    //     seq++;

    //     if(data.type === 'line') {
    //       // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
    //       data.element.animate({
    //         opacity: {
    //           // The delay when we like to start the animation
    //           begin: seq * delays + 1000,
    //           // Duration of the animation
    //           dur: durations,
    //           // The value where the animation should start
    //           from: 0,
    //           // The value where it should end
    //           to: 1
    //         }
    //       });
    //     } 
    //     else if(data.type === 'label' && data.axis === 'x') {
    //       data.element.animate({
    //         y: {
    //           begin: seq * delays,
    //           dur: durations,
    //           from: data.y + 100,
    //           to: data.y,
    //           // We can specify an easing function from Chartist.Svg.Easing
    //           easing: 'easeOutQuart'
    //         }
    //       });
    //     } 
    //     else if(data.type === 'label' && data.axis === 'y') {
    //       data.element.animate({
    //         x: {
    //           begin: seq * delays,
    //           dur: durations,
    //           from: data.x - 100,
    //           to: data.x,
    //           easing: 'easeOutQuart'
    //         }
    //       });
    //     } 
    //     else if(data.type === 'point') {
    //       data.element.animate({
    //         x1: {
    //           begin: seq * delays,
    //           dur: durations,
    //           from: data.x - 10,
    //           to: data.x,
    //           easing: 'easeOutQuart'
    //         },
    //         x2: {
    //           begin: seq * delays,
    //           dur: durations,
    //           from: data.x - 10,
    //           to: data.x,
    //           easing: 'easeOutQuart'
    //         },
    //         opacity: {
    //           begin: seq * delays,
    //           dur: durations,
    //           from: 0,
    //           to: 1,
    //           easing: 'easeOutQuart'
    //         }
    //       });
    //     } 
    //     else if(data.type === 'grid') {
    //       // Using data.axis we get x or y which we can use to construct our animation definition objects
    //       var pos1Animation = {
    //         begin: seq * delays,
    //         dur: durations,
    //         from: data[data.axis.units.pos + '1'] - 30,
    //         to: data[data.axis.units.pos + '1'],
    //         easing: 'easeOutQuart'
    //       };

    //       var pos2Animation = {
    //         begin: seq * delays,
    //         dur: durations,
    //         from: data[data.axis.units.pos + '2'] - 100,
    //         to: data[data.axis.units.pos + '2'],
    //         easing: 'easeOutQuart'
    //       };

    //       var animations = {};
    //         animations[data.axis.units.pos + '1'] = pos1Animation;
    //         animations[data.axis.units.pos + '2'] = pos2Animation;
    //         animations['opacity'] = {
    //         begin: seq * delays,
    //         dur: durations,
    //         from: 0,
    //         to: 1,
    //         easing: 'easeOutQuart'
    //       };

    //       data.element.animate(animations);
    //     }
    //   });

    //   // For the sake of the example we update the chart every time it's created with a delay of 10 seconds
    //   chart.on('created', function() {
    //     if(window.__exampleAnimateTimeout) {
    //         clearTimeout(window.__exampleAnimateTimeout);
    //         window.__exampleAnimateTimeout = null;
    //       }
    //       window.__exampleAnimateTimeout = setTimeout(chart.update.bind(chart), 12000);
    //   });
    // /* Line chart */

    // /*Analysis  Line chart */
    //   var chart = new Chartist.Line('.analysis-line-chart', {
    //     labels: ['1/1/2019', '2/1/2019', '3/1/2019', '4/1/2019', '5/1/2019', '6/1/2019','7/1/2019'],
    //     series: [
    //       [100,90,70,210,50,140,250],
    //       [100,150,130,70,30,50,150],
    //       [80,10,110,56,24,96,110]
    //     ]
    //   },
    //   {  
    //     height: '200px',
    //     axisX: {
    //       showGrid: false,
    //       offset: 40
    //     },
    //     axisY: {
    //       showGrid: true,
    //       type: Chartist.FixedScaleAxis,
    //       ticks: [0,50, 100, 150, 200, 250],
    //       low: 0,
    //       high:250
    //     },
    //   },
    //   [
    //     ['screen and (max-width: 1280px)', {
    //       height:'300px'
    //     }],
    //     ['screen and (max-width: 576px)', {
    //       axisX: {
    //         showLabel: false
    //       }
    //     }]
    //   ]
    //   );

    //   // Let's put a sequence number aside so we can use it in the event callbacks
    //   var seq = 0,
    //   delays = 80,
    //   durations = 500;

    //   // Once the chart is fully created we reset the sequence
    //   chart.on('created', function() {
    //     seq = 0;
    //   });

    //   // On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations
    //   chart.on('draw', function(data) {
    //     seq++;

    //     if(data.type === 'line') {
    //       // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
    //       data.element.animate({
    //         opacity: {
    //           // The delay when we like to start the animation
    //           begin: seq * delays + 1000,
    //           // Duration of the animation
    //           dur: durations,
    //           // The value where the animation should start
    //           from: 0,
    //           // The value where it should end
    //           to: 1
    //         }
    //       });
    //     } 
    //     else if(data.type === 'label' && data.axis === 'x') {
    //       data.element.animate({
    //         y: {
    //           begin: seq * delays,
    //           dur: durations,
    //           from: data.y + 100,
    //           to: data.y,
    //           // We can specify an easing function from Chartist.Svg.Easing
    //           easing: 'easeOutQuart'
    //         }
    //       });
    //     } 
    //     else if(data.type === 'label' && data.axis === 'y') {
    //       data.element.animate({
    //         x: {
    //           begin: seq * delays,
    //           dur: durations,
    //           from: data.x - 100,
    //           to: data.x,
    //           easing: 'easeOutQuart'
    //         }
    //     });
    //     } 
    //     else if(data.type === 'point') {
    //       data.element.animate({
    //         x1: {
    //           begin: seq * delays,
    //           dur: durations,
    //           from: data.x - 10,
    //           to: data.x,
    //           easing: 'easeOutQuart'
    //         },
    //       x2: {
    //         begin: seq * delays,
    //         dur: durations,
    //         from: data.x - 10,
    //         to: data.x,
    //         easing: 'easeOutQuart'
    //       },
    //       opacity: {
    //         begin: seq * delays,
    //         dur: durations,
    //         from: 0,
    //         to: 1,
    //         easing: 'easeOutQuart'
    //       }
    //     });
    //     } 
    //     else if(data.type === 'grid') { 
    //       // Using data.axis we get x or y which we can use to construct our animation definition objects
    //       var pos1Animation = {
    //         begin: seq * delays,
    //         dur: durations,
    //         from: data[data.axis.units.pos + '1'] - 30,
    //         to: data[data.axis.units.pos + '1'],
    //         easing: 'easeOutQuart'
    //       };

    //       var pos2Animation = {
    //         begin: seq * delays,
    //         dur: durations,
    //         from: data[data.axis.units.pos + '2'] - 100,
    //         to: data[data.axis.units.pos + '2'],
    //         easing: 'easeOutQuart'
    //       };

    //       var animations = {};
    //         animations[data.axis.units.pos + '1'] = pos1Animation;
    //         animations[data.axis.units.pos + '2'] = pos2Animation;
    //         animations['opacity'] = {
    //         begin: seq * delays,
    //         dur: durations,
    //         from: 0,
    //         to: 1,
    //         easing: 'easeOutQuart'
    //       };

    //       data.element.animate(animations);
    //     }
    //   });

    //   // For the sake of the example we update the chart every time it's created with a delay of 10 seconds
    //   chart.on('created', function() {
    //     if(window.__exampleAnimateTimeout) {
    //       clearTimeout(window.__exampleAnimateTimeout);
    //       window.__exampleAnimateTimeout = null;
    //     }
    //     window.__exampleAnimateTimeout = setTimeout(chart.update.bind(chart), 12000);
    //   });
    // /* Analysis Line chart */

    // /* Donut Chart */
    //   var chart = new Chartist.Pie('.do-nut-chart', {
    //     series: [10, 20, 50, 20, 5, 50, 15,20],
    //     labels: [1, 2, 3, 4, 5, 6, 7,8]
    //   },
    //   {
    //     donut: true,
    //     showLabel: false,
    //     donutWidth: 20,
    //     startAngle: 0,
    //     width:'100%',
    //     height:'200px'
    //   },
    //     [['screen and (max-width: 1280px)', {
    //       height:'300px'
    //     }]]
    //   );

    //   chart.on('draw', function(data) {
    //     if(data.type === 'slice') {
    //       // Get the total path length in order to use for dash array animation
    //       var pathLength = data.element._node.getTotalLength();
    //       // Set a dasharray that matches the path length as prerequisite to animate dashoffset
    //       data.element.attr({
    //         'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
    //       });

    //       // Create animation definition while also assigning an ID to the animation for later sync usage
    //       var animationDefinition = {
    //         'stroke-dashoffset': {
    //           id: 'anim' + data.index,
    //           dur: 1000,
    //           from: -pathLength + 'px',
    //           to:  '0px',
    //           easing: Chartist.Svg.Easing.easeOutQuint,
    //           // We need to use `fill: 'freeze'` otherwise our animation will fall back to initial (not visible)
    //           fill: 'freeze'
    //         }
    //       };

    //       // If this was not the first slice, we need to time the animation so that it uses the end sync event of the previous animation
    //       if(data.index !== 0) {
    //         animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
    //       }

    //       // We need to set an initial value before the animation starts as we are not in guided mode which would do that for us
    //       data.element.attr({
    //         'stroke-dashoffset': -pathLength + 'px'
    //       });

    //       // We can't use guided mode as the animations need to rely on setting begin manually
    //       // See http://gionkunz.github.io/chartist-js/api-documentation.html#chartistsvg-function-animate
    //       data.element.animate(animationDefinition, false);
    //     }
    //   });

    //   // For the sake of the example we update the chart every time it's created with a delay of 8 seconds
    //   chart.on('created', function() {
    //     if(window.__anim21278907124) {
    //       clearTimeout(window.__anim21278907124);
    //       window.__anim21278907124 = null;
    //     }
    //     window.__anim21278907124 = setTimeout(chart.update.bind(chart), 10000);
    //   });
    // /* Donut Chart */

    // /* Donut Chart for current allocation recommendation */
    //   // HTML Label plugin
    //   Chartist.plugins = Chartist.plugins || {};
    //   Chartist.plugins.ctHtmlLabels = function(options) {
    //     return function(chart) {
    //       chart.on('draw', function(context) {
    //         if (context.type === 'label') {
    //           // Best to combine with something like sanitize-html
    //           context.element.empty()._node.innerHTML = context.text;
    //         }
    //       });
    //     }
    //   }
    //   var chart = new Chartist.Pie('.do-nut-chart-allocation', {
    //     series:[5, 15, 24, 3, 13, 14, 35],
    //     labels: ['5','6', '24','3','13','14','35'],
    //     },
    //     {
    //       donut: true,
    //       showLabel: true,
    //       donutWidth: 30,
    //       startAngle: 0,
    //       width:'100%',
    //       height:'250px',
    //     },
    //   );
    //   chart.on('draw', function(data) {
    //     if(data.type === 'slice') {
    //       // Get the total path length in order to use for dash array animation
    //       var pathLength = data.element._node.getTotalLength();

    //       // Set a dasharray that matches the path length as prerequisite to animate dashoffset
    //       data.element.attr({
    //         'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
    //       });

    //       // Create animation definition while also assigning an ID to the animation for later sync usage
    //         var animationDefinition = {
    //         'stroke-dashoffset': {
    //           id: 'anim' + data.index,
    //           dur: 1000,
    //           from: -pathLength + 'px',
    //           to:  '0px',
    //           easing: Chartist.Svg.Easing.easeOutQuint,
    //           // We need to use `fill: 'freeze'` otherwise our animation will fall back to initial (not visible)
    //           fill: 'freeze'
    //         }
    //       };

    //       // If this was not the first slice, we need to time the animation so that it uses the end sync event of the previous animation
    //       if(data.index !== 0) {
    //         animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
    //       }

    //       // We need to set an initial value before the animation starts as we are not in guided mode which would do that for us
    //         data.element.attr({
    //         'stroke-dashoffset': -pathLength + 'px'
    //       });

    //       // We can't use guided mode as the animations need to rely on setting begin manually
    //       // See http://gionkunz.github.io/chartist-js/api-documentation.html#chartistsvg-function-animate
    //       data.element.animate(animationDefinition, false);
    //     }
    //   });

    //   // For the sake of the example we update the chart every time it's created with a delay of 8 seconds
    //   chart.on('created', function() {
    //     if(window.__anim21278907124) {
    //       clearTimeout(window.__anim21278907124);
    //       window.__anim21278907124 = null;
    //     }
    //     window.__anim21278907124 = setTimeout(chart.update.bind(chart), 10000);
    //   });
    //   /* Donut Chart for current allocation recommendation */

    //   /* Donut Chart for Standard allocation recommendation */
    //   var chart = new Chartist.Pie('.do-nut-chart-standard-allocation', {
    //     series:[5, 15, 24, 3, 13, 14, 35],
    //     labels: ['5','6', '24','3','13','14','35'],
    //     },
    //     {
    //       donut: true,
    //       showLabel: true,
    //       donutWidth: 30,
    //       startAngle: 0,
    //       width:'100%',
    //       height:'250px',
    //     },
    //   );

    //   chart.on('draw', function(data) {
    //     if(data.type === 'slice') {
    //       // Get the total path length in order to use for dash array animation
    //       var pathLength = data.element._node.getTotalLength();

    //       // Set a dasharray that matches the path length as prerequisite to animate dashoffset
    //       data.element.attr({
    //         'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
    //       });

    //       // Create animation definition while also assigning an ID to the animation for later sync usage
    //         var animationDefinition = {
    //         'stroke-dashoffset': {
    //           id: 'anim' + data.index,
    //           dur: 1000,
    //           from: -pathLength + 'px',
    //           to:  '0px',
    //           easing: Chartist.Svg.Easing.easeOutQuint,
    //           // We need to use `fill: 'freeze'` otherwise our animation will fall back to initial (not visible)
    //           fill: 'freeze'
    //         }
    //       };

    //       // If this was not the first slice, we need to time the animation so that it uses the end sync event of the previous animation
    //       if(data.index !== 0) {
    //         animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
    //       }

    //       // We need to set an initial value before the animation starts as we are not in guided mode which would do that for us
    //         data.element.attr({
    //         'stroke-dashoffset': -pathLength + 'px'
    //       });

    //       // We can't use guided mode as the animations need to rely on setting begin manually
    //       // See http://gionkunz.github.io/chartist-js/api-documentation.html#chartistsvg-function-animate
    //       data.element.animate(animationDefinition, false);
    //     }
    //   });

    //   // For the sake of the example we update the chart every time it's created with a delay of 8 seconds
    //   chart.on('created', function() {
    //     if(window.__anim21278907124) {
    //       clearTimeout(window.__anim21278907124);
    //       window.__anim21278907124 = null;
    //     }
    //     window.__anim21278907124 = setTimeout(chart.update.bind(chart), 10000);
    //   });
    // /* Donut Chart for Standard allocation recommendation */

    // /* Pie chart */
    //   var chart = new Chartist.Pie('.pie-chart', {
    //     labels: ['Equity','Grand Total'],
    //     series: [5, 5]
    //     },
    //     {
    //       donut: false,
    //       showLabel: true,
    //       width:'100%',
    //       height:'300px'
    //     },
    //     [['screen and (max-width: 1280px)', {
    //       height:'300px'
    //     }]]
    //   );
    // /* Pie chart */


    // /* Bar Chart */
    //   new Chartist.Bar('.bar-chart', {
    //     labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    //     series: [
    //       [800000, 1200000, 1400000, 1300000],
    //       [200000, 400000, 500000, 300000],
    //       [100000, 200000, 400000, 600000]
    //     ]
    //     }, 
    //     {
    //       stackBars: true,
    //       height:'230px',
    //       axisY: {
    //         labelInterpolationFnc: function(value) {
    //           return (value / 1000) + 'k';
    //         }
    //       }
    //     }).on('draw', function(data) {
    //       if(data.type === 'bar') {
    //         data.element.attr({
    //           style: 'stroke-width: 30px'
    //         });
    //       }
    //     });
    /* Bar Chart */

    /* Date Picker */
    // $("#datepicker").datepicker({
    //   autoclose: true,
    //   todayHighlight: true
    // }).datepicker('update', new Date());
    /* Date Picker */

});

function progressbar(tabId) {
    $("#" + tabId).find(".progress-bar").each(function () {
        var each_bar_width = $(this).attr("aria-valuenow");
        //alert(each_bar_width)
        $(this).width(each_bar_width + "%");

        $(this).closest(".progress").find(".progess-value-block ").animate({ left: each_bar_width + "%" });
        $(this).closest(".progress").find(".progress-value").text(each_bar_width)
    });
}

function resetprogressbar() {
    $(".progress-bar").width("0");
    $(".progess-value-block ").animate({ left: 0 });
}
