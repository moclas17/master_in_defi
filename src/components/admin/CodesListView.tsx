'use client'

/**
 * Component to display all POAP codes and their claim status
 */

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface POAPCode {
  id: string
  dropId: string
  qrHash: string
  claimed: boolean
  claimedByWallet?: string
  claimedByEmail?: string
  claimedAt?: string
  createdAt: string
}

interface Drop {
  id: string
  protocolId: string
  name: string
  eventId: number
}

export function CodesListView() {
  const [drops, setDrops] = useState<Drop[]>([])
  const [selectedDropId, setSelectedDropId] = useState<string>('all')
  const [codes, setCodes] = useState<POAPCode[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, claimed: 0, available: 0 })

  useEffect(() => {
    fetchDrops()
  }, [])

  useEffect(() => {
    if (selectedDropId && selectedDropId !== 'all') {
      fetchCodes(selectedDropId)
    }
  }, [selectedDropId])

  const fetchDrops = async () => {
    try {
      const response = await fetch('/api/admin/drops')
      const data = await response.json()

      if (response.ok) {
        setDrops(data.drops)
        if (data.drops.length > 0) {
          setSelectedDropId(data.drops[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching drops:', error)
    }
  }

  const fetchCodes = async (dropId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/codes?dropId=${dropId}`)
      const data = await response.json()

      if (response.ok) {
        setCodes(data.codes)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const selectedDrop = drops.find(d => d.id === selectedDropId)

  return (
    <div className="space-y-6">
      {/* Header with drop selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Códigos POAP
          </h2>
          <p className="text-zinc-400 text-sm">
            Visualiza todos los códigos y su estado de reclamo
          </p>
        </div>

        <select
          value={selectedDropId}
          onChange={(e) => setSelectedDropId(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Selecciona un drop</option>
          {drops.map(drop => (
            <option key={drop.id} value={drop.id}>
              {drop.protocolId.toUpperCase()} - {drop.name}
            </option>
          ))}
        </select>
      </div>

      {selectedDropId && selectedDropId !== 'all' && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-zinc-900 border-zinc-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Total Códigos</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="text-4xl">📦</div>
              </div>
            </Card>

            <Card className="p-6 bg-green-900/20 border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-400 mb-1">Disponibles</p>
                  <p className="text-3xl font-bold text-green-400">{stats.available}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-900/20 border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-400 mb-1">Reclamados</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.claimed}</p>
                </div>
                <div className="text-4xl">🎉</div>
              </div>
            </Card>
          </div>

          {/* Progress bar */}
          {stats.total > 0 && (
            <Card className="p-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-zinc-400">Progreso de reclamos</span>
                <span className="text-white font-medium">
                  {Math.round((stats.claimed / stats.total) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${(stats.claimed / stats.total) * 100}%` }}
                />
              </div>
            </Card>
          )}

          {/* Codes Table */}
          {loading ? (
            <Card className="p-12 text-center">
              <div className="text-zinc-400">Cargando códigos...</div>
            </Card>
          ) : codes.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-zinc-400 mb-2">
                No hay códigos cargados para este drop
              </p>
              <p className="text-sm text-zinc-500">
                Sube códigos desde la pestaña "Ver Drops"
              </p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50 border-b border-zinc-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Código QR Hash
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Reclamado Por
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Fecha de Reclamo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        URL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {codes.map((code, index) => (
                      <tr
                        key={code.id}
                        className={`${
                          code.claimed ? 'bg-blue-900/5' : 'hover:bg-zinc-800/30'
                        } transition-colors`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm font-mono text-white bg-zinc-800 px-2 py-1 rounded">
                            {code.qrHash}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {code.claimed ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/30 text-blue-400 border border-blue-500/50">
                              ✓ Reclamado
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/30 text-green-400 border border-green-500/50">
                              ○ Disponible
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-300">
                          {code.claimedByWallet ? (
                            <div>
                              <div className="font-mono text-xs">
                                {code.claimedByWallet.slice(0, 6)}...{code.claimedByWallet.slice(-4)}
                              </div>
                              {code.claimedByEmail && (
                                <div className="text-xs text-zinc-500 mt-1">
                                  {code.claimedByEmail}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-600">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                          {formatDate(code.claimedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a
                            href={`https://poap.xyz/claim/${code.qrHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 hover:underline"
                          >
                            Ver POAP →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
