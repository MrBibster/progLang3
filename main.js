const request = require('request');
const fs = require('fs');
const token = 'token';
const location = 'Moscow';
function data_write(events) {
    let event_log = '';
    let dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let cur_day = -1;
    for (let i = 0; i < events.length; ++i) {
        let date = new Date(events[i].start.utc);
        let day = date.getDay();
        event_log += `<div>
            <h1>${cur_day !== day ? dow[day] : ''}</h1>
            <h2><a href="${events[i].url}">${events[i].name.text}</a></h2>
            Date: ${date}<br/>
            ${events[i].description.text}
            <hr/>
        </div>`;
        cur_day = day;
    }
    const html = `
    <!DOCTYPE html>
    <html charset="utf-8">
    <head>
    </head>
    <body>
        ${event_log}
    </body>
    </html>
    `;
    fs.writeFile('./events.html', html, function(error) {
        if(error) {
            return console.log(error);
        }
        console.log('Ивенты получены');
    });
}
function scan_events(callback, page=1, events) {
    console.log(`Получение ${page} страницы`);
    request({
            url: 'https://www.eventbriteapi.com/v3/events/search/',
            qs: {
                token: token,
                subcategories: 1000,
                sort_by: 'date',
                'start_date.keyword': 'next_week',
                'location.address': location,
                page
            },
            method: 'GET',
            json: true
        },
        (error, response, body) => {
        if (error) {
            return;
        }
        events = events ? events.concat(body.events) : body.events;
    if (body.pagination.page_count <= page) {
        callback(events);
    } else {
        scan_events(callback, page + 1, events);
    }
});
}
scan_events(data_write);