/**
 * Script de diagnóstico para verificar la conexión y datos de la base de datos
 */

import { getAllProtocols, getProtocolById } from '../src/lib/db/protocols'
import { getQuestionsByProtocol } from '../src/lib/db/questions'

async function testDatabase() {
  console.log('🔍 Testing database connection and data...\n')

  try {
    // Test 1: Get all protocols
    console.log('1️⃣ Fetching all protocols...')
    const protocols = await getAllProtocols()
    console.log(`✅ Found ${protocols.length} protocols:`)
    protocols.forEach(p => {
      console.log(`   - ${p.id}: ${p.name} (${p.title})`)
    })
    console.log()

    // Test 2: Get specific protocols
    for (const protocolId of ['aave', 'morpho', 'sablier']) {
      console.log(`2️⃣ Fetching protocol: ${protocolId}...`)
      const protocol = await getProtocolById(protocolId)
      if (protocol) {
        console.log(`✅ Protocol found: ${protocol.name}`)
        console.log(`   - Title: ${protocol.title}`)
        console.log(`   - Active: ${protocol.active}`)
        console.log(`   - Secret Word: ${protocol.secretWord}`)
      } else {
        console.log(`❌ Protocol NOT found: ${protocolId}`)
      }
      console.log()
    }

    // Test 3: Get questions for each protocol
    for (const protocolId of ['aave', 'morpho', 'sablier']) {
      console.log(`3️⃣ Fetching questions for: ${protocolId}...`)
      const questions = await getQuestionsByProtocol(protocolId, false)
      console.log(`✅ Found ${questions.length} questions`)
      questions.forEach((q, idx) => {
        console.log(`   ${idx + 1}. ${q.text}`)
        console.log(`      Answers: ${q.answers.length}`)
      })
      console.log()
    }

    console.log('✅ Database test completed successfully!')
  } catch (error) {
    console.error('❌ Database test failed:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Stack trace:', error.stack)
    }
  }
}

// Run the test
testDatabase()
