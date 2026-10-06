import {test} from 'node:test';import assert from 'node:assert/strict';
import {eventFromForm,validateEvent,suggestionToEvent} from '../public/event-model.js';
const valid=()=>eventFromForm({title:'Event',templeName:'Temple',city:'Austin',state:'TX',address:'Test address',dateStart:'2026-12-01',status:'draft'});
test('event validates and fills missing end date',()=>assert.equal(validateEvent(valid()).dateEnd,'2026-12-01'));
test('impossible dates, reversed dates and unsafe links rejected',()=>{for(const change of [{dateStart:'2026-02-30'},{dateEnd:'2025-01-01'},{link:'javascript:alert(1)'},{status:'unknown'}])assert.throws(()=>validateEvent({...valid(),...change}));});
test('suggestion import is a draft and excludes private sender details',()=>{const e=suggestionToEvent({type:'tmf-suggestion',subject:'Event',from_name:'Private Person',reply_to:'private@example.com',message:'Public details'});assert.equal(e.status,'draft');assert.ok(!JSON.stringify(e).includes('private@example.com'));assert.ok(!JSON.stringify(e).includes('Private Person'));assert.throws(()=>suggestionToEvent({type:'bad'}));});
