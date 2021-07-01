import { Router } from 'itty-router'

const router = Router()
const ceramicApiEndpoint = 'https://gateway.ceramic.network'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Max-Age': '86400',
}

/*
Trigger a pinset update for a did
*/
router.post('/pinset/:did/request', async request => {
    const body = await request.json()
    if (!body.pinsetRecordID) {
        return new Response(
            JSON.stringify({ error: "Could not find field 'pinsetRecordID'" }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
                status: 400,
            }
        )
    }

    // Fetch latest pinset
    const response = await fetch(
        `${ceramicApiEndpoint}/api/v0/streams/${body.pinsetRecordID}`
    )
    const stream = await response.json()
    if (!stream || !stream.state || !stream.state.metadata) {
        return new Response(JSON.stringify({ error: 'Malformed response' }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
            status: 500,
        })
    }

    if (!stream.state.metadata.controllers.includes(request.params.did)) {
        return new Response(
            JSON.stringify({ error: 'Record not controlled by DID' }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
                status: 400,
            }
        )
    }
    if (!stream.state.content || !stream.state.content.root) {
        return new Response(JSON.stringify({ error: 'Bad record found' }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
            status: 400,
        })
    }
    const rootCID = stream.state.content.root.replace('ipfs://', '')

    // Check if already pinned
    const existingPin = await PINS.get(rootCID)
    if (existingPin) {
        return new Response(JSON.stringify({ success: true }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
            status: 200,
        })
    }

    // Pin rootCID to Estuary
    const pinResponse = await fetch(
        'https://api.estuary.tech/content/add-ipfs',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${ESTUARY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: rootCID,
                root: rootCID,
            }),
        }
    )
    const result = await pinResponse.json()
    if (!result.content || !result.content.active) {
        return new Response(
            JSON.stringify({ error: 'Malformed pin response' }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
                status: 500,
            }
        )
    }

    // Cache CID
    await PINS.put(rootCID, result.content.id)

    return new Response(JSON.stringify({ success: true }), {
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
        status: 201,
    })
})

/*
This is the last route we define, it will match anything that hasn't hit a route we've defined
above, therefore it's useful as a 404 (and avoids us hitting worker exceptions, so make sure to include it!).

Visit any page that doesn't exist (e.g. /foobar) to see it in action.
*/
router.all('*', () => new Response('404, not found!', { status: 404 }))

/*
This snippet ties our worker to the router we deifned above, all incoming requests
are passed to the router where your routes are called and the response is sent.
*/
addEventListener('fetch', e => {
    e.respondWith(router.handle(e.request))
})
