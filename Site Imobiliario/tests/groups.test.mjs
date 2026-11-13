import test from 'node:test';
import assert from 'node:assert/strict';
import {editorContents} from '../src/registration-editor.js';
test('os cinco tópicos solicitados são grupos nativos colapsáveis no formulário renderizado',()=>{
  const html=editorContents({username:'teste',role:'manager'},null,{});
  const groups=[...html.matchAll(/<details[^>]+data-phase-group="([^"]+)"[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>/g)];
  assert.equal(groups.length,5);
  const expected=['Identidade','Características','Ofertas e Condições','O espaço em primeiro plano','Somente para a equipe'];
  for(const [index,group] of groups.entries())assert.ok(group[2].includes(expected[index]));
});
