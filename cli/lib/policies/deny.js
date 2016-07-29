'use strict';

var deny = exports;

var _ = require('lodash');
var Promise = require('es6-promise').Promise;
var Policy = require('./policy').Policy;
var Statement = require('./policy').Statement;
var output = require('../cli/output');
var rpath = require('common/rpath');
var harvest = require('./harvest');

var EFFECT_DENY = Statement.EFFECTS.DENY;

deny.output = {};

deny.output.success = output.create(function (payload) {
  var team = payload.team.body;
  var policy = payload.policy.body.policy;
  var secretStatements = _.filter(policy.statements, function (statement) {
    return statement.resource.split('/').length > 6;
  });

  var msg = 'Policy generated and attached to the ' + team.name + ' team.';
  msg += '\n';

  _.each(secretStatements, function (statement, i) {
    msg += '\n  Effect: ' + statement.effect;
    msg += '\n  Action(s): ' + statement.action.join(', ');
    msg += '\n  Resource: ' + statement.resource;

    if (secretStatements.length !== i + 1 && secretStatements.length > 0) {
      msg += '\n  -';
    }
  });

  console.log(msg);
});
deny.output.failure = output.create(function () {
  console.log('Policy could not be generated, please try again.');
});

/**
 * Create prompt for deny
 *
 * @param {object} ctx - Command context
 */
deny.execute = function (ctx) {
  return new Promise(function (resolve, reject) {
    if (ctx.params.length < 2) {
      return reject(new Error('You must provide two parameters'));
    }

    var params = harvest(ctx);

    var pathSegments = params.path.split('/');

    var secret = _.takeRight(pathSegments);
    var path = _.take(pathSegments, pathSegments.length - 1).join('/');

    var resourceMap = rpath.parse(path, secret);
    var expandedResources = rpath.expand(resourceMap);

    var policy = new Policy('generated-deny-' + Math.floor(Date.now() / 1000));

    _.each(expandedResources, function (r) {
      var statement = new Statement(EFFECT_DENY);

      statement.setActions(params.actions);
      statement.setResource(r);

      policy.addStatement(statement);
    });

    var payload = {};
    return ctx.api.orgs.get({ name: pathSegments[1] })
      .then(function (res) {
        payload.org = res[0];

        if (!payload.org) {
          return reject(new Error('Unknown org: ' + pathSegments[1]));
        }

        return ctx.api.teams.get({ name: params.team, org_id: payload.org.id });
      })
      .then(function (res) {
        payload.team = res[0];

        if (!payload.team) {
          return reject(new Error('Unknown team: ' + params.team));
        }

        return ctx.api.policies.create({
          org_id: payload.org.id,
          policy: _.toPlainObject(policy)
        });
      })
      .then(function (res) {
        payload.policy = res;

        if (!payload.policy) {
          return reject(new Error('Error creating policy'));
        }

        return ctx.api.policyAttachments.create({
          org_id: payload.org.id,
          owner_id: payload.team.id,
          policy_id: payload.policy.id
        });
      })
      .then(function () {
        return resolve(payload);
      })
      .catch(reject);
  });
};