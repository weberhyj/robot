import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildCameraStreamUrl,
  createBin,
  deleteBin,
  fetchAlertEnums,
  fetchAlertPage,
  fetchBinEnums,
  sendGripperClose,
  sendGripperOpen,
  triggerCameraDetection,
  updateBin,
} from './plcRobotApi'

const fetchMock = vi.fn()

describe('plc robot HTTP API adapter', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    fetchMock.mockReset()
  })

  it('sends a gripper open command without position', async () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(createJsonResponse({ success: true, action: 'open', message: 'opened' }))

    await expect(sendGripperOpen()).resolves.toEqual({ success: true, action: 'open', message: 'opened' })

    expectFetchCalledWith('/api/v1/gripper/control?action=open')
  })

  it('sends a gripper close command with target position in millimeters', async () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(createJsonResponse({ success: true, action: 'close', message: 'closed' }))

    await expect(sendGripperClose(20)).resolves.toEqual({ success: true, action: 'close', message: 'closed' })

    expectFetchCalledWith('/api/v1/gripper/control?action=close&position=20')
  })

  it('triggers a single camera detection request', async () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(createJsonResponse({
      success: true,
      material: 'orange',
      confidence: 98.7,
      coord_x: 320.4,
      coord_y: 215.6,
      coord_z: 128.3,
      detect_time: '2025-05-20 11:24:30',
      image_base64: '/9j/4AAQ',
    }))

    await expect(triggerCameraDetection()).resolves.toMatchObject({
      success: true,
      material: 'orange',
      confidence: 98.7,
    })

    expectFetchCalledWith('/api/v1/camera/detect')
  })

  it('builds a complete camera stream URL without fetching JSON', () => {
    vi.stubGlobal('window', { location: { origin: 'http://localhost:5174', protocol: 'http:' } })

    expect(buildCameraStreamUrl({ fps: 15 })).toBe('http://127.0.0.1:8080/api/v1/camera/stream?fps=15')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fetches alert enum dictionaries', async () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(createJsonResponse({
      alert_types: [{ value: 'camera_timeout', label: 'Camera timeout' }],
      alert_levels: [{ value: 'critical', label: 'Critical' }],
      alert_statuses: [{ value: 'pending', label: 'Pending' }],
    }))

    await expect(fetchAlertEnums()).resolves.toMatchObject({
      alert_types: [{ value: 'camera_timeout', label: 'Camera timeout' }],
    })

    expectFetchCalledWith('/api/v1/alert/enums')
  })

  it('fetches a filtered alert page', async () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(createJsonResponse({
      total: 1,
      page: 2,
      page_size: 20,
      total_pages: 3,
      items: [],
    }))

    await expect(fetchAlertPage({
      page: 2,
      page_size: 20,
      alert_type: 'bin_capacity_full',
      alert_level: 'warning',
      status: 'pending',
      start_time: '2026-05-11T00:00:00',
      end_time: '2026-05-12T00:00:00',
    })).resolves.toMatchObject({
      page: 2,
      page_size: 20,
      total: 1,
    })

    expectFetchCalledWith('/api/v1/alert?page=2&page_size=20&alert_type=bin_capacity_full&alert_level=warning&status=pending&start_time=2026-05-11T00%3A00%3A00&end_time=2026-05-12T00%3A00%3A00')
  })

  it('fetches bin enum dictionaries', async () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(createJsonResponse({
      bin_types: [{ value: 'ok', label: 'OK料箱' }],
      material_types: [{ value: 'orange', label: 'orange' }],
    }))

    await expect(fetchBinEnums()).resolves.toMatchObject({
      bin_types: [{ value: 'ok', label: 'OK料箱' }],
    })

    expectFetchCalledWith('/api/v1/bin/enums')
  })

  it('creates a bin with JSON payload', async () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(createJsonResponse({
      id: 4,
      name: 'BIN_OK_01',
      bin_type: 'ok',
      material_type: 'orange',
      total_capacity: 2000,
      current_load: 0,
      fill_rate: 0,
      length: 1200,
      width: 800,
      height: 600,
      position_x: 1250,
      position_y: 860,
      is_calibrated: false,
      created_at: '2026-05-25T10:30:00',
      updated_at: '2026-05-25T10:30:00',
    }))

    await expect(createBin({
      bin_type: 'ok',
      current_load: 0,
      material_type: 'orange',
      name: 'BIN_OK_01',
      total_capacity: 2000,
    })).resolves.toMatchObject({
      id: 4,
      name: 'BIN_OK_01',
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/bin', {
      body: JSON.stringify({
        bin_type: 'ok',
        current_load: 0,
        material_type: 'orange',
        name: 'BIN_OK_01',
        total_capacity: 2000,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: expect.any(AbortSignal),
    })
  })

  it('updates a bin with partial JSON payload', async () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(createJsonResponse({
      id: 3,
      name: 'BIN_NG_01',
      bin_type: 'ng',
      material_type: 'apple',
      total_capacity: 1200,
      current_load: 760,
      fill_rate: 63.3,
      length: 1000,
      width: 760,
      height: 560,
      position_x: 3680,
      position_y: 860,
      is_calibrated: true,
      created_at: '2026-05-25T10:30:00',
      updated_at: '2026-05-25T11:00:00',
    }))

    await expect(updateBin(3, { current_load: 760 })).resolves.toMatchObject({
      id: 3,
      current_load: 760,
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/bin/3', {
      body: JSON.stringify({ current_load: 760 }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      signal: expect.any(AbortSignal),
    })
  })

  it('deletes a bin without reading a JSON body', async () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(createNoContentResponse())

    await expect(deleteBin(3)).resolves.toBeUndefined()

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/bin/3', {
      method: 'DELETE',
      signal: expect.any(AbortSignal),
    })
  })
})

function expectFetchCalledWith(url: string): void {
  expect(fetchMock).toHaveBeenCalledWith(url, {
    signal: expect.any(AbortSignal),
  })
}

function createJsonResponse(data: unknown): Pick<Response, 'json' | 'ok' | 'status' | 'statusText'> {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => data,
  }
}

function createNoContentResponse(): Pick<Response, 'ok' | 'status' | 'statusText'> {
  return {
    ok: true,
    status: 204,
    statusText: 'No Content',
  }
}
