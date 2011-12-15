/*jslint browser: true */
/*global _, jQuery, $, console, Backbone */

var exercise = {};

(function($){
    
    exercise.Activity = Backbone.Model.extend({
    });
    
    exercise.Activities = Backbone.Collection.extend({
        model: exercise.Activity,
        url: "exercise.json"
    });
    
    exercise.ActivityListView = Backbone.View.extend({
        tagName: 'ul',
        id: 'activities-list',
        attributes: {"data-role": 'listview'},
        
        initialize: function() {
            this.collection.bind('add', this.add, this);
            this.template = _.template($('#activity-list-item-template').html());
        },
        
        render: function() {
            var container = this.options.viewContainer,
                activities = this.collection,
                template = this.template,
                listView = $(this.el);
                
            $(this.el).empty();
            activities.each(function(activity){
                listView.append(template(activity.toJSON()));
            });
            container.html($(this.el));
            container.trigger('create');
            return this;
        },
        
        add: function(item) {
            var activitiesList = $('#activities-list'),
                template = this.template;
                
            activitiesList.append(template(item.toJSON()));
            activitiesList.listview('refresh');
        }
    });
    
    exercise.initData = function(){
        exercise.activities = new exercise.Activities();
        exercise.activities.fetch({async: false});  // use async false to have the app wait for data before rendering the list
    };
    
}(jQuery));

$('#activities').live('pageinit', function(event){
    var activitiesListContainer = $('#activities').find(":jqmData(role='content')"),
        activitiesListView;
    exercise.initData();
    activitiesListView = new exercise.ActivityListView({collection: exercise.activities, viewContainer: activitiesListContainer});
    activitiesListView.render();
});

$('#add-button').live('click', function(){
    var today = new Date(),
        date;
    
    date = (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();
    exercise.activities.add({id: 6, date: date, type: 'Walk', distance: '2 miles', comments: 'Wow...that was easy.'});
});