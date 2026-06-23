"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export interface ParsedAddress {
  street: string
  city: string
  state: string
  zip: string
}

let mapsPromise: Promise<void> | null = null
function loadMaps(): Promise<void> {
  if (typeof window === "undefined" || !KEY) return Promise.reject()
  if ((window as any).google?.maps?.places?.AutocompleteSuggestion) return Promise.resolve()
  if (!mapsPromise) {
    mapsPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script")
      s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places&v=weekly`
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => reject()
      document.head.appendChild(s)
    })
  }
  return mapsPromise
}

function parse(components: any[]): ParsedAddress {
  const get = (type: string, short = false) => {
    const c = (components || []).find((x: any) => x.types?.includes(type))
    return c ? (short ? c.shortText : c.longText) : ""
  }
  return {
    street: [get("street_number"), get("route")].filter(Boolean).join(" "),
    city: get("locality") || get("sublocality") || get("postal_town"),
    state: get("administrative_area_level_1", true),
    zip: get("postal_code"),
  }
}

/**
 * Residential street-address input with Google Places (New) autocomplete + a custom
 * dropdown. Uses AutocompleteSuggestion (the supported API; the legacy Autocomplete
 * widget is disabled for newer Google accounts). Without a key it's a plain input.
 */
export function PlacesAddressInput({
  value,
  onChange,
  onAddress,
  id = "street",
}: {
  value: string
  onChange: (v: string) => void
  onAddress: (a: ParsedAddress) => void
  id?: string
}) {
  const placesRef = useRef<any>(null)
  const tokenRef = useRef<any>(null)
  const debounceRef = useRef<any>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!KEY) return
    loadMaps()
      .then(() => {
        const places = (window as any).google?.maps?.places
        if (places?.AutocompleteSuggestion) {
          placesRef.current = places
          tokenRef.current = new places.AutocompleteSessionToken()
        }
      })
      .catch(() => {})
  }, [])

  const onInput = (v: string) => {
    onChange(v)
    if (!placesRef.current || v.trim().length < 3) {
      setSuggestions([])
      setOpen(false)
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const { suggestions } = await placesRef.current.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: v,
          includedRegionCodes: ["us"],
          sessionToken: tokenRef.current,
        })
        setSuggestions((suggestions || []).filter((s: any) => s.placePrediction))
        setOpen(true)
      } catch {
        setSuggestions([])
        setOpen(false)
      }
    }, 250)
  }

  const choose = async (s: any) => {
    setOpen(false)
    const pred = s.placePrediction
    onChange(pred?.mainText?.text || pred?.text?.text || value)
    try {
      const place = pred.toPlace()
      await place.fetchFields({ fields: ["addressComponents"] })
      onAddress(parse(place.addressComponents || []))
    } catch {
      /* keep typed value */
    }
    if (placesRef.current) tokenRef.current = new placesRef.current.AutocompleteSessionToken()
  }

  return (
    <div className="relative">
      <Input
        id={id}
        name="address-line1"
        autoComplete="address-line1"
        value={value}
        onChange={(e) => onInput(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Street address"
        className="mt-1.5"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                {s.placePrediction?.text?.text || ""}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
