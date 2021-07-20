import { useRecords, RecordsTable } from 'admin-bro'
import { useHistory, useLocation } from 'react-router-dom'
import { Box, Pagination, Text } from '@admin-bro/design-system'
import React, { useEffect } from 'react'

const NO_OF_COLUMNS = 5

// Each object in derivedProperties represents a column whose value is derived from other resources.
const derivedProperties = [
  {
    name: 'posts',
    label: 'Posts',
    type: 'number',
    propertyPath: 'posts'
  },
  {
    name: 'columns',
    label: 'Columns',
    type: 'number',
    propertyPath: 'columns'
  }
]

const listPuserComponent = props => {
  const { records, loading, direction, sortBy, page, total, perPage } = useRecords(props.resource.id)
  useEffect(() => {
    if (props.resource.listProperties.length === NO_OF_COLUMNS) {
      return
    }
    let i = 0
    while (i < derivedProperties.length) {
      props.resource.listProperties.push({
        availableValues: null,
        custom: {},
        hideLabel: false,
        isArray: false,
        isDisabled: false,
        isId: false,
        isRequired: true,
        isSortable: true,
        isTitle: false,
        isVirtual: false,
        label: derivedProperties[i].label,
        name: derivedProperties[i].name,
        position: 101,
        propertyPath: derivedProperties[i].propertyPath,
        props: {},
        reference: null,
        resourceId: 'PseudoUser',
        subProperties: [],
        type: derivedProperties[i].type
      })
      i += 1
    }
  }, [])

  const handleSelect = () => {}
  const handleSelectAll = () => {}

  const location = useLocation()
  const history = useHistory()

  const handleActionPerformed = () => {
    // here is a trigger for a case when user performs an action without component (like `delete`)
  }

  const handlePaginationChange = pageNumber => {
    const search = new URLSearchParams(location.search)
    search.set('page', pageNumber.toString())
    history.push({ search: search.toString() })
  }

  return (
    <Box variant="white">
      <RecordsTable
        resource={props.resource}
        records={records}
        actionPerformed={handleActionPerformed}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        selectedRecords={null}
        direction={direction}
        sortBy={sortBy}
        isLoading={loading}
      />
      <Text mt="xl" textAlign="center">
        <Pagination page={page} perPage={perPage} total={total} onChange={handlePaginationChange} />
      </Text>
    </Box>
  )
}

export default listPuserComponent
