import { Router } from 'itty-router'
import { verifyMessage } from '@ethersproject/wallet'
import { randomString } from '@stablelib/random'

const router = Router()
const ceramicApiEndpoint = 'https://gateway.ceramic.network'

const PINATA_ENDPOINT = 'https://api.pinata.cloud/psa'
const ESTUARY_ENDPOINT = 'https://api.estuary.tech'
const ESTUARY_PINNING_ENDPOINT = 'https://api.estuary.tech/pinning'
const pinningServiceEndpoint = ESTUARY_PINNING_ENDPOINT

const ipfsPreloadNodes = [
    '/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
    '/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
    '/dns4/node2.preload.ipfs.io/tcp/443/wss/p2p/QmV7gnbW5VTcJ3oyM2Xk1rdFBJ3kTkvxc87UFGsun29STS',
    '/dns4/node3.preload.ipfs.io/tcp/443/wss/p2p/QmY7JB6MQXhxHvq7dBDh4HpbH29v4yE9JRadAVpndvzySN',
]

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}

/* 
    Estuary Collection APIs
*/

router.options('/estuary/nonce', async request => {
    return new Response(null, {
        headers: corsHeaders,
    })
})

router.options('/estuary/token', async request => {
    return new Response(null, {
        headers: corsHeaders,
    })
})

/*
    Generate a nonce
*/
router.get('/estuary/nonce', async request => {
    const nonce = randomString(10)
    await ESTUARY_NONCES.put(nonce, 'true', { expirationTtl: 60 * 60 })
    return new Response(JSON.stringify({ nonce: nonce }), {
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
        status: 200,
    })
})

/*
    Get an Estuary token by sending a SIWE signature + nonce
    TODO: Check if user owns a parcel
*/
router.post('/estuary/token', async request => {
    const body = await request.json()
    if (!body.siwe) {
        return new Response(
            JSON.stringify({
                message: 'Expected SIWE object as body',
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
                status: 422,
            }
        )
    }

    const recoveredAddress = verifyMessage(
        toMessage(body.siwe),
        body.siwe.signature
    )
    if (recoveredAddress.toLowerCase() !== body.siwe.address.toLowerCase()) {
        return new Response(
            JSON.stringify({
                message: 'Signature does not belong to issuer',
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
                status: 401,
            }
        )
    }

    if (!body.siwe.nonce) {
        return new Response(JSON.stringify({ message: 'Nonce not found' }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
            status: 422,
        })
    }

    const nonceCheck = await ESTUARY_NONCES.get(body.siwe.nonce)
    if (!nonceCheck) {
        return new Response(JSON.stringify({ message: 'Nonce not valid' }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
            status: 422,
        })
    }

    // Delete nonce
    await ESTUARY_NONCES.delete(body.siwe.nonce)

    // Fetch token
    const tokenResponse = await fetch(
        `${ESTUARY_ENDPOINT}/user/api-keys?perms=upload&expiry=24h`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${ESTUARY_API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    )
    const result = await tokenResponse.json()

    return new Response(JSON.stringify({ token: result.token }), {
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
        status: 200,
    })
})

/*
    Get the latest collection CIDs for an asset
*/
router.get('/dids/:did/assets/:assetId/collection', async request => {})

/*
    Trigger an update to an asset's collection
*/
router.post('/dids/:did/assets/:assetId/collection', async request => {})

/* Taken from ceramic-cacao */
function toMessage(siwe) {
    const header = `${siwe.domain} wants you to sign in with your Ethereum account:`
    const uriField = `URI: ${siwe.uri}`
    let prefix = [header, siwe.address].join('\n')
    const versionField = `Version: ${siwe.version}`

    if (!siwe.nonce) {
        siwe.nonce = (Math.random() + 1).toString(36).substring(4)
    }

    const nonceField = `Nonce: ${siwe.nonce}`

    const suffixArray = [uriField, versionField, nonceField]

    if (siwe.issuedAt) {
        Date.parse(siwe.issuedAt)
    }
    siwe.issuedAt = siwe.issuedAt ? siwe.issuedAt : new Date().toISOString()
    suffixArray.push(`Issued At: ${siwe.issuedAt}`)

    if (siwe.expirationTime) {
        const expiryField = `Expiration Time: ${siwe.expirationTime}`

        suffixArray.push(expiryField)
    }

    if (siwe.notBefore) {
        suffixArray.push(`Not Before: ${siwe.notBefore}`)
    }

    if (siwe.requestId) {
        suffixArray.push(`Request ID: ${siwe.requestId}`)
    }

    if (siwe.chainId) {
        suffixArray.push(`Chain ID: ${siwe.chainId}`)
    }

    if (siwe.resources) {
        suffixArray.push(
            [`Resources:`, ...siwe.resources.map(x => `- ${x}`)].join('\n')
        )
    }

    const suffix = suffixArray.join('\n')

    if (siwe.statement) {
        prefix = [prefix, siwe.statement].join('\n\n')
    }

    return [prefix, suffix].join('\n\n')
}

/*
    Deprecated Pinset APIs
*/

router.options('/pinset/:did/request', async request => {
    return new Response(null, {
        headers: corsHeaders,
    })
})

router.options('/pinset/:did/request/:pinsetRecordID', async request => {
    return new Response(null, {
        headers: corsHeaders,
    })
})

/*
Get the latest pinset
*/
router.get('/pinset/:did/latest', async request => {
    const assetId = request.query.assetId
    const key = assetId
        ? `${request.params.did}_${assetId}`
        : request.params.did
    const latestCommitId = await PINS.get(key)
    if (!latestCommitId) {
        return new Response(JSON.stringify({ status: 'Not Found' }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
            status: 404,
        })
    }

    return new Response(JSON.stringify({ latestCommitId: latestCommitId }), {
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
        status: 200,
    })
})

/*
Get the status of a request
*/
router.get('/pinset/:did/request/:pinsetRecordID', async request => {
    const assetId = request.query.assetId
    const key = assetId
        ? `${request.params.did}_${assetId}`
        : request.params.did

    // Fetch latest pinset
    const response = await fetch(
        `${ceramicApiEndpoint}/api/v0/streams/${request.params.pinsetRecordID}`
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
    if (
        (!stream.state.content || !stream.state.content.root) &&
        (!stream.state.next || !stream.state.next.content.root)
    ) {
        return new Response(JSON.stringify({ error: 'Bad record found' }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
            status: 400,
        })
    }
    const content = stream.state.next
        ? stream.state.next.content
        : stream.state.content
    const rootCID = content.root.replace('ipfs://', '')

    // Check if already pinned
    const existingPin = await PINS.get(rootCID)
    if (!existingPin) {
        return new Response(JSON.stringify({ status: 'Not Found' }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
            status: 404,
        })
    }

    const pinResponse = await fetch(
        `${pinningServiceEndpoint}/pins/${existingPin}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${ESTUARY_API_KEY}`,
            },
        }
    )
    const result = await pinResponse.json()
    if (!result.status) {
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

    // Cache CID on pinned
    if (result.status == 'pinned') {
        await PINS.put(key, request.params.pinsetRecordID)
    }

    return new Response(JSON.stringify({ status: result.status }), {
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
        status: 200,
    })
})

/*
Trigger a pinset update for a did
*/
router.post('/pinset/:did/request', async request => {
    const assetId = request.query.assetId
    const key = assetId
        ? `${request.params.did}_${assetId}`
        : request.params.did

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
    if (
        (!stream.state.content || !stream.state.content.root) &&
        (!stream.state.next || !stream.state.next.content.root)
    ) {
        return new Response(JSON.stringify({ error: 'Bad record found' }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
            status: 400,
        })
    }
    const content = stream.state.next
        ? stream.state.next.content
        : stream.state.content
    const rootCID = content.root.replace('ipfs://', '')

    // Check if already pinned
    const existingPin = await PINS.get(rootCID)
    if (existingPin) {
        const pinResponse = await fetch(
            `${pinningServiceEndpoint}/pins/${existingPin}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${ESTUARY_API_KEY}`,
                },
            }
        )
        const result = await pinResponse.json()
        if (!result.status) {
            return new Response(
                JSON.stringify({
                    error: `Malformed pin response: ${JSON.stringify(result)}`,
                }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                    status: 500,
                }
            )
        }

        if (result.status == 'pinned') {
            await PINS.put(key, body.pinsetRecordID)
        }

        return new Response(JSON.stringify({ status: result.status }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
            status: 200,
        })
    }

    // Pin rootCID to pinning service
    const pinResponse = await fetch(`${pinningServiceEndpoint}/pins`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${ESTUARY_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: rootCID,
            cid: rootCID,
            origins: ipfsPreloadNodes,
        }),
    })
    const result = await pinResponse.json()
    if (!result.status) {
        return new Response(
            JSON.stringify({
                error: `Malformed pin response: ${JSON.stringify(result)}`,
            }),
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
    await PINS.put(rootCID, result.requestid)
    if (result.status == 'pinned') {
        await PINS.put(key, body.pinsetRecordID)
    }

    return new Response(JSON.stringify({ status: result.status }), {
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
