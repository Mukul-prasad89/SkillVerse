import { createContext, useContext, useReducer } from 'react'

const Ctx = createContext(null)

const initial = {
  goal: '',
  hours: 10,
  months: 6,
  level: 'Student',
  known: [],
  roadmap: null,
  completed: [],
  selectedNode: null,
  loading: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FORM':
      return { ...state, ...action.payload }
    case 'SET_ROADMAP':
      return { ...state, roadmap: action.payload, completed: [], selectedNode: null }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SELECT_NODE':
      return { ...state, selectedNode: action.payload }
    case 'COMPLETE_NODE': {
      const id = action.payload
      if (state.completed.includes(id)) return state
      return { ...state, completed: [...state.completed, id] }
    }
    case 'RESTORE_COMPLETED':
      return { ...state, completed: action.payload }
    case 'UPDATE_ROADMAP':
      return { ...state, roadmap: { ...state.roadmap, ...action.payload } }
    default:
      return state
  }
}

export function RoadmapProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial)
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}

export const useRoadmap = () => useContext(Ctx)
