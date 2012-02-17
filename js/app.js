/*jslint browser: true */
/*global _, jQuery, $, console, Backbone */

var exercise = {};

(function($){
    exercise.Activity = Backbone.Model.extend({
        defaults: {
            date: new Date(),
            type: '',
            distance: '',
            comments: '',
            minutes: ''
        },
        
        dateInputType: function(){
            return exercise.formatDate(this.get('date'), "yyyy-mm-dd");
        },
        
        displayDate: function(){
            return exercise.formatDate(this.get('date'), "mm/dd/yyyy");
        },
        
        toJSON: function(){
            var json = Backbone.Model.prototype.toJSON.call(this);
            return _.extend(json, {dateInputType : this.dateInputType(), displayDate: this.displayDate()});
        }
    });
    
    exercise.formatDate = function(date, formatString){
        var yyyy, month, mm, day, dd, formatedDate;
        
        if (date instanceof Date){
            yyyy = date.getFullYear();
            month = date.getMonth() + 1;
            mm = month < 10 ? "0" + month : month;
            day = date.getDate();
            dd = day < 10 ? "0" + day : day;
            
            formatedDate = formatString.replace(/yyyy/i, yyyy);
            formatedDate = formatedDate.replace(/mm/i, mm);
            formatedDate = formatedDate.replace(/dd/i, dd);
        }else{
            formatedDate = "";
        }
        
        return formatedDate;
    };
    
    exercise.Activities = Backbone.Collection.extend({
        model: exercise.Activity,
        url: "exercise.json",
        comparator: function(activity){
            var date = new Date(activity.get('date'));
            return date.getTime();
        },
        
        parse: function(response){
            var fixedDate = [];
            _.each(response, function(item){
                var stringDate = item.date;
                item.date = new Date(stringDate); //https://github.com/jquery/jquery-mobile/issues/2755
            });
            return response;
        }
    });
    
    exercise.ActivityListView = Backbone.View.extend({
        tagName: 'ul',
        id: 'activities-list',
        attributes: {"data-role": 'listview'},
        
        initialize: function() {
            this.collection.bind('add', this.render, this);
            this.template = _.template($('#activity-list-item-template').html());
        },
        
        render: function() {
            var container = this.options.viewContainer,
                activities = this.collection,
                template = this.template,
                listView = $(this.el);
                
            $(this.el).empty();
            activities.each(function(activity){
                var renderedItem = template(activity.toJSON()),
                    $renderedItem = $(renderedItem);  //convert the html into an jQuery object
                    $renderedItem.jqmData('activityId', activity.get('id'));  //set the data on it for use in the click event
                $renderedItem.bind('click', function(){
                    //set the activity id on the page element for use in the details pagebeforeshow event
                    $('#activity-details').jqmData('activityId', $(this).jqmData('activityId'));  //'this' represents the element being clicked
                });
                listView.append($renderedItem);
            });
            container.html($(this.el));
            container.trigger('create');
            return this;
        }
    });
    
    exercise.ActivityDetailsView = Backbone.View.extend({
        //since this template will render inside a div, we don't need to specify a tagname
        initialize: function() {
            this.template = _.template($('#activity-details-template').html());
        },
        
        render: function() {
            var container = this.options.viewContainer,
                activity = this.model,
                renderedContent = this.template(this.model.toJSON());
                
            container.html(renderedContent);
            container.trigger('create');
            return this;
        }
    });
    
    exercise.ActivityFormView = Backbone.View.extend({
        //since this template will render inside a div, we don't need to specify a tagname, but we do want the fieldcontain
        attributes: {"data-role": 'listview'},
        
        initialize: function() {
            this.template = _.template($('#activity-form-template').html());
        },
        
        render: function() {
            var container = this.options.viewContainer,
                renderedContent = this.template(this.model.toJSON());
                
            container.html(renderedContent);
            container.trigger('create');
            return this;
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
    var activity = new exercise.Activity(),
        activityForm = $('#activity-form-form'),
        activityFormView;
    
    activityFormView = new exercise.ActivityFormView({model: activity, viewContainer: activityForm});
    activityFormView.render();
});

$('#activity-details').live('pagebeforeshow', function(){
    console.log('activityId: ' + $('#activity-details').jqmData('activityId'));
    var activitiesDetailsContainer = $('#activity-details').find(":jqmData(role='content')"),
        activityDetailsView,
        activityId = $('#activity-details').jqmData('activityId'),
        activityModel = exercise.activities.get(activityId);
    
    activityDetailsView = new exercise.ActivityDetailsView({model: activityModel, viewContainer: activitiesDetailsContainer});
    activityDetailsView.render();
});

$('#edit-activity-button').live('click', function() {
    var activityId = $('#activity-details').jqmData('activityId'),
        activityModel = exercise.activities.get(activityId),
        activityForm = $('#activity-form-form'),
        activityFormView;
        
    activityFormView = new exercise.ActivityFormView({model: activityModel, viewContainer: activityForm});
    activityFormView.render();
});