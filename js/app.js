
//TASK ENTITY
var Task =  Em.Object.extend({
	//instantiate these
	name:'',
	timeSpan :0,
	limit :0,
	entries : [],
	dependencies : [],

	//property to set to tigger time based updates
	update: 0,

	//computed property that tells how many hits with timeSpan
	hits : function(key,value) {
		var self = this;
		return self.get('entries').filter(function(d) {
			return d.get("date").getTime() > ((new Date()).getTime() - self.get("timeSpan") );
		}).get("length");
	}.property('entries.@each.date','update'),

	//hit method
	hit : function() {
		var self = this;
		if (this.get("enabled")) {
			this.get("entries").pushObject(Em.Object.create({date:new Date()}));
      var db = window.openDatabase("Database", "1.0", "MaintenanceTest", 200000);
      db.transaction(function(tx) {
				var sql = 'INSERT INTO TEST (id, taskname,time) VALUES ('+(Math.floor(1000000*Math.random()))+', "'+self.get("name")+'","'+(new Date()).getTime()+'")';
				tx.executeSql(sql);

			}, errorCB, successCB);
		}
	},

	//computed propterty telling if task is successful
	success : function() {
		return this.get('hits') >= this.get("limit");
	}.property('hits','limit','update'),


	//computed property telling when task can be hit
	enabled : function() {
		return 0 == this.get("dependencies").filterProperty('success',false).get('length');
	}.property('dependencies.@each.success'),


	isValid : function() {
		return this.get("name") &&
			this.get("timeSpan") &&
			this.get("limit");
	}

});




var App = Em.Application.create({
	rootElement : "#App"
});

App.ApplicationController = Ember.Controller.extend({});
App.ApplicationView = Ember.View.extend({
	template:Ember.Handlebars.compile(" {{outlet}} ")
});

App.EditController = Ember.Controller.extend({});
App.EditView = Ember.View.extend({
	template:Ember.Handlebars.compile(" {{outlet}} ")
});

//UI INTERFACE OPTIONS
App.Options = {};
App.Options.DaySelection = [
		{'value' : (1000*60*60*24), 'label' : '1 Day'},
		{'value' : (1000*60*60*24*2), 'label' : '2 Days'},
		{'value' : (1000*60*60*24*3), 'label' : '3 Days'},
		{'value' : (1000*60*60*24*4), 'label' : '4 Days'},
		{'value' : (1000*60*60*24*5), 'label' : '5 Days'},
		{'value' : (1000*60*60*24*6), 'label' : '6 Days'},
		{'value' : (1000*60*60*24*7), 'label' : '1 Week'},
		{'value' : (1000*60*60*24*14), 'label' : '2 Weeks'},
	];


App.Level1 = [];
App.Level2 = [];
App.Level3 = [];

App.Level1.push(Task.create({
	name : "Sug",
	timeSpan : 3*24*60*60*1000,
	limit : 4,
	dependencies : [],
	entries : [],
}));

App.Level1.push(Task.create({
	name : "Zzz",
	timeSpan : 4*24*60*60*1000,
	limit : 8,
	dependencies : [],
	entries : [],
}));

App.Level1.push(Task.create({
	name : "120",
	timeSpan : 2*24*60*60*1000,
	limit : 2,
	dependencies : [],
	entries : [],
}));

App.Level2.push(Task.create({
	name : "Run",
	timeSpan : 7*24*60*60*1000,
	limit : 3,
	dependencies : [App.Level1.findProperty("name","Sug")],
	entries : [],
}));

App.Level2.push(Task.create({
	name : "Wrk",
	timeSpan : 7*24*60*60*1000,
	limit : 4,
	dependencies : [App.Level1.findProperty("name","Zzz")],
	entries : [],
}));

App.Level3.push(Task.create({
	name:"Hgl",
	timeSpan : 7*24*60*60*1000,
	limit : 1,
	dependencies : [App.Level2.findProperty("name","Wrk")],
	entries : []
}));

//UPDATE MECHANISM
setInterval(function() {
	App.Level1.forEach(function(a) { a.set('update',Math.random()) });
	App.Level2.forEach(function(a) { a.set('update',Math.random()) });
	App.Level3.forEach(function(a) { a.set("update",Math.random()) });
},1000);

    // Wait for Cordova to load
    //
    document.addEventListener("deviceready", onDeviceReady, false);

    // Cordova is ready
    //

    function onDeviceReady() {
        var db = window.openDatabase("Database", "1.0", "MaintenanceTest", 200000);
        db.transaction(populateDB, errorCB, successCB);
    }

    // Populate the database
    //
    function populateDB(tx) {
         tx.executeSql('CREATE TABLE IF NOT EXISTS Tasks (id unique, name, timesapn)');



         tx.executeSql('CREATE TABLE IF NOT EXISTS Dependencies (id, dep)');
         tx.executeSql('CREATE TABLE IF NOT EXISTS Entries (id unique, taskname, time)');
				 /*tx.executeSql('SELECT * FROM TEST',[],function(tx,results) {
						for (var a=0; a<results.rows.length;a++) {
							for (var b=1;b<=3;b++) {
								App["Level"+b].forEach(function(d) {
										if(d.get("name") == results.rows.item(a).taskname) {
												d.get("entries").pushObject(Em.Object.create(
												{date:new Date(parseInt(results.rows.item(a).time))}
											));
										}
								});
							}
						}
				 },errorCB);*/
    }

		onDeviceReady();

    // Transaction error callback
    //
    function errorCB(tx, err) {
        alert("Error processing SQL: "+err);
    }

    // Transaction success callback
    //
    function successCB() {
        //alert("success!");
    }



//VIEWS

App.EditView = Em.View.extend({
	tagName: "form",
	templateName: "edit",
	isValid : false,

	task : Task.create({
		name:"Example",
		timespan : 1000*60*60*24*7,
		limit : 4,
	}),

	submit : function(e) {
		return false;
	},

	timeSpan : Em.Select.extend({
		didInsertElement : function() {
			this.set("selection",App.Options.DaySelection.findProperty("value",this.get("timespan")))
		},
		contentBinding: "App.Options.DaySelection",
		optionLabelPath : "content.label",
		optionValuePath : "content.value",

	})

});




App.MyView = Em.View.extend({
	templateName : 'main'
});

App.LevelView = Em.View.extend({
	tagName:"div",
	templateName : "level-items",
	classNames:['level-items']
});

App.ItemView = Em.View.extend({
	tagName:"span",
	classNames:['task-button'],
	classNameBindings: ['isenabled'],
	isenabled : true,

	test : function() {
		this.set("isenabled",this.get("context").enabled);
	}.observes("context.enabled"),


	templateName : "item",
  touchStart: function(e) {
		this.get("context").hit();
  },

  click: function(e) {
		this.get("context").hit();
  }
});

App.TestView = Em.View.extend({

	tagName : "span",
	template: Ember.Handlebars.compile('asdfasdfasdfsfsafdsdfas'),

});

App.Router = Ember.Router.extend({
	enableLogging: true,
	location: Ember.Location.create({
		implementation: 'hash'
	}),
	root: Ember.Route.extend({
		index: Ember.Route.extend({
			connectOutlets: function(router) {
				var applicationController = router.get('applicationController');
				applicationController.connectOutlet({viewClass:App.MyView});
			},
			route: '/'
		}),
		edit : Ember.Route.extend({
			connectOutlets: function(router) {
				var editController = router.get("editController");
				editController.connectOutlet({viewClass.App.TestView});
			}
		})
	})
});

App.router = App.Router.create();


App.initialize(App.router);

