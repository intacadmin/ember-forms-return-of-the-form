import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from 'ember';

/* globals ok:true */

moduleForComponent('em-form', {
  // Specify the other units that are required for this test
  needs: ['component:em-form-submit', 'component:em-input', 'component:form-group', 'component:em-form-control-help', 'component:form-group-control']
});

var FormController = Ember.Controller.extend({
  actions: {
    submit() {
      ok(true, 'submit action invoked!');
    }
  }
});

var FormCustomActionController = Ember.Controller.extend({
  actions: {
    submitNow() {
      ok(true, 'submitNow action invoked!');
    }
  }
});

var somePerson = Ember.Object.create({
  name: 'my-name',
  errors: Ember.Object.create(),
  validate() {
    var promise = new Ember.RSVP.Promise((resolve) => {
      resolve('ok!');
    });
    return promise;
  }
});

test('form rendering', function(assert) {
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  this.render();
  assert.equal(component._state, 'inDOM');
  var elem = Ember.$(component.element);

  assert.equal(elem.attr("role"), "form", "Has form role.");
  assert.equal(elem.prop('tagName'), 'FORM', "Form got rendered");
  assert.ok(elem.find('button').get(0), "Submit got rendered");
  assert.ok(!component.get('model'), 'Form does not have a model');
});

test('submit button rendering', function(assert) {
  var component = this.subject();
  this.render();

  var elem = Ember.$(component.element);
  assert.ok(elem.find('button').get(0), "Submit got rendered");

  Ember.run(() => {
    component.set('submitButton', false);
  });

  assert.ok(!elem.find('button').get(0), "No submit button is rendered");
});

test('form layout - default', function(assert) {
  var component = this.subject();
  this.render();

  var elem = Ember.$(component.element);
  assert.ok(elem.hasClass('form'), "Is form");
  assert.ok(!elem.hasClass('form-inline'), "Is not inline");
  assert.ok(!elem.hasClass('form-horizontal'), "Is not horizontal");

  assert.ok(component.get('isDefaultLayout'));
  assert.ok(!component.get('isInline'));
  assert.ok(!component.get('isHorizontal'));
});

test('form layout - inline', function(assert) {
  var component = this.subject({
    formLayout: 'inline'
  });
  this.render();

  var elem = Ember.$(component.element);
  assert.ok(elem.hasClass('form-inline'), "Is inline");
  assert.ok(!elem.hasClass('form'), "Is not form");
  assert.ok(!elem.hasClass('form-horizontal'), "Is not horizontal");

  assert.ok(component.get('isInline'));
  assert.ok(!component.get('isDefaultLayout'));
  assert.ok(!component.get('isHorizontal'));
});

test('form layout - horizontal', function(assert) {
  var component = this.subject({
    formLayout: 'horizontal'
  });
  this.render();

  var elem = Ember.$(component.element);
  assert.ok(elem.hasClass('form-horizontal'), "Is horizontal");
  assert.ok(!elem.hasClass('form'));
  assert.ok(!elem.hasClass('form-inline'));

  assert.ok(component.get('isHorizontal'));
  assert.ok(!component.get('isDefaultLayout'));
  assert.ok(!component.get('isInline'));
});

test('form model is set', function(assert) {
  var component = this.subject({
    model: somePerson
  });

  assert.equal(component.get('model.name'), 'my-name', 'Model was set.');
});

test('a form display errors when rendered if showErrorsOnRender is set', function(assert) {
  assert.expect(1);
  var component = this.subject({
    targetObject: FormController.create(),
    model: somePerson,
    showErrorsOnRender: true,
    template: Ember.HTMLBars.compile('{{em-input property="name"}}')
  });

  Ember.run(() => {
    component.get('model').set('isValid', false);
    component.get('model').set('errors.name', Ember.A(['name!']));
  });

  this.render();

  Ember.run(() => {
    assert.equal(Ember.$(component.element).find('div:contains("name!")').length, 1, "Found help text on form");
  });
});

test('a form display errors when field is focused in', function(assert) {
  assert.expect(1);
  var component = this.subject({
    targetObject: FormController.create(),
    model: somePerson,
    showErrorsOnFocusIn: true,
    template: Ember.HTMLBars.compile('{{em-input property="name"}}')
  });

  Ember.run(() => {
    component.get('model').set('isValid', false);
    component.get('model').set('errors.name', Ember.A(['name!']));
  });

  this.render();

  Ember.run(() => {
    Ember.$(component.element).find('input').focusin();
  });

  Ember.run(() => {
    assert.equal(Ember.$(component.element).find('div:contains("name!")').length, 1, "Found help text on form");
  });
});

test('a form display errors when field is focused out', function(assert) {
  assert.expect(1);
  var component = this.subject({
    targetObject: FormController.create(),
    model: somePerson,
    template: Ember.HTMLBars.compile('{{em-input property="name"}}')
  });

  Ember.run(() => {
    component.get('model').set('isValid', false);
    component.get('model').set('errors.name', Ember.A(['name!']));
  });

  this.render();

  Ember.run(() => {
    Ember.$(component.element).find('input').focusout();
  });

  Ember.run(() => {
    assert.equal(Ember.$(component.element).find('div:contains("name!")').length, 1, "Found help text on form");
  });
});

test('a form display errors on key up events when field has showOnKeyUp is set', function(assert) {
  assert.expect(1);
  var component = this.subject({
    targetObject: FormController.create(),
    model: somePerson,
    template: Ember.HTMLBars.compile('{{em-input property="name" showOnKeyUp=true}}')
  });

  Ember.run(() => {
    component.get('model').set('isValid', false);
    component.get('model').set('errors.name', Ember.A(['name!']));
  });

  this.render();

  Ember.run(() => {
    Ember.$(component.element).find('input').keyup();
  });

  Ember.run(() => {
    assert.equal(Ember.$(component.element).find('div:contains("name!")').length, 1, "Found help text on form");
  });
});

test('a form update inputs on model change', function(assert) {
  var component = this.subject({
    targetObject: FormController.create(),
    model: somePerson,
    template: Ember.HTMLBars.compile('{{em-input property="name"}}')
  });

  this.render();

  var input = Ember.$(component.element).find('input');
  assert.equal(input.length, 1, "Found input");
  input = Ember.$(input[0]);
  assert.equal(input.val(), 'my-name', "Input has original model value");

  Ember.run(() => {
    somePerson.set('name', 'joseph');
  });

  assert.equal(input.val(), 'joseph', "Input has new model value");

  Ember.run(() => {
    somePerson.set('name', 'my-name');
  });

  assert.equal(input.val(), 'my-name', "Input has original model value again");

});

test('form cannot be submitted if model is invalid', function(assert) {
  assert.expect(0);
  var component = this.subject({
    targetObject: FormController.create(),
    model: somePerson
  });

  this.render();

  Ember.run(() => {
    component.get('model').set('isValid', false);
  });

  Ember.run(() => {
    Ember.$(component.element).find('button').click();
  });
});

test('form can be submitted if model is valid', function(assert) {
  assert.expect(1);
  var component = this.subject({
    targetObject: FormController.create(),
    model: somePerson
  });

  this.render();

  Ember.run(() => {
    component.get('model').set('isValid', true);
  });

  Ember.run(() => {
    Ember.$(component.element).find('button').click();
  });
});

test('form submission with custom action', function(assert) {
  assert.expect(1);
  var component = this.subject({
    targetObject: FormCustomActionController.create(),
    model: somePerson,
    action: 'submitNow'
  });

  this.render();

  Ember.run(() => {
    component.get('model').set('isValid', true);
  });

  Ember.run(() => {
    Ember.$(component.element).find('button').click();
  });
});

test('form submission with a model that has no validation support and no isValid property should be submitted', function(assert) {
  assert.expect(1);
  var component = this.subject({
    targetObject: FormController.create(),
    model: {}
  });

  this.render();

  Ember.run(() => {
    Ember.$(component.element).find('button').click();
  });
});
