const AccessControl = require('accesscontrol');

let roles = [
    //admin
    {role:'admin', resource: 'user', action:'create:any'},
    {role:'admin', resource: 'user', action:'delete:any'},
    {role:'admin', resource: 'user', action:'read:any'},
    {role:'admin', resource: 'user', action:'update:any'},

    //customer
    {role:'customer', resource: 'user', action:'update:own'},
];

const ac = new AccessControl(roles);

module.exports = ac;