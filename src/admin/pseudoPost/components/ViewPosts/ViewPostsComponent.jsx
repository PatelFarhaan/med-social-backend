import { useRecords } from 'admin-bro'
import axios from 'axios'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  ApproveUser,
  UserApproved,
  Delete,
  Left,
  Right,
  Post,
  Select,
  ButtonBar,
  CardText,
  CardTitle,
  CardContent,
  CardImage,
  Card,
  CardContainer,
  Container,
  Layout
} from './ViewPostsComponentStyles'

import ShowThreadsComponent from '../ShowThreads/ShowThreadsComponent'
import NotApprovedComponent from '../NotApproved/NotApprovedComponent'

const ViewPostsComponent = props => {
  const { records } = useRecords(props.resource.id)
  const [columns, setColumns] = useState([])
  const [user, setUser] = useState(0)
  const [modal, setModal] = useState(false)
  const [notApproved, setNotApproved] = useState(false)
  const [conversationId, setConversationId] = useState(0)

  const approveUser = async username => {
    await axios.get(`${props.action.custom.baseUrl}/admin/api/resources/PseudoUser/records/${username}/approveUser`)
    // eslint-disable-next-line no-undef
    window.location.reload(false)
  }

  const deleteUser = async id => {
    await axios.get(`${props.action.custom.baseUrl}/admin/api/resources/PseudoPost/records/${id}/delete`)
    // eslint-disable-next-line no-undef
    window.location.reload(false)
  }

  const showModal = id => {
    if (!id) {
      return
    }
    setConversationId(id)
    setModal(true)
  }

  const hideModal = () => {
    setConversationId(0)
    setModal(false)
  }

  const hideNotApproved = () => {
    setNotApproved(false)
  }

  const showNotApproved = () => {
    setNotApproved(true)
  }

  const Buttons = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
  `

  useEffect(() => {
    const getColumns = async () => {
      const response = await axios.get(`${props.action.custom.baseUrl}/admin/api/resources/Column/actions/list`)
      setColumns(response.data.records)
    }

    getColumns()
  }, [])

  useEffect(
    () => {
      const getUser = async username => {
        if (!username) {
          return
        }
        const response = await axios.get(`${props.action.custom.baseUrl}/admin/api/resources/PseudoUser/records/${username}/getUser`)
        setUser(response.data.record.params)
      }
      getUser(records[0]?.params.username)
    },
    [records]
  )

  const changeSelect = (id, e) => {
    /**
     * fetch record using id
     * insert into record object; column
     */
    records.forEach(record => {
      if (record.params.id === id) {
        record.params.column = e.target.value
      }
    })
  }

  const post = id => {
    /**
     * fetch record using id
     * get column and conversationId from the record
     * iff column is present hit api
     */
    if (!user?.active) {
      setNotApproved(true)
      return
    }
    records.forEach(async record => {
      if (record.params.id === id && record.params.column) {
        await axios.get(
          `${props.action.custom.baseUrl}/admin/api/resources/PseudoPost/records/${id}/approvePost?slug=${
            record.params.column
          }&conversationId=${record.params.conversationId}`
        )
        // eslint-disable-next-line no-undef
        window.location.reload(false)
      }
    })
  }
  return (
    <Layout>
      <Container>
        <CardContainer>
          {modal ? (
            <ShowThreadsComponent
              handleClose={hideModal}
              isOpen={modal}
              user={user}
              conversationId={conversationId}
              baseUrl={props.action.custom.baseUrl}
            />
          ) : null}
          {notApproved ? (
            <NotApprovedComponent handleClose={hideNotApproved} isOpen={notApproved} user={user} baseUrl={props.action.custom.baseUrl} />
          ) : null}
          {user?.active ? (
            <UserApproved disabled>User Approved</UserApproved>
          ) : (
            <>
              <ApproveUser onClick={() => approveUser(records[0]?.params.username)}>Approve User</ApproveUser>
            </>
          )}
          {records &&
            records.map((record, key) =>
              record?.params.id === record?.params.conversationId ? (
                <Card key={key}>
                  {/* <CardImage src="https://picsum.photos/500/300/?image=10" /> */}
                  <CardContent>
                    <CardTitle>{record.params.username}</CardTitle>
                    <CardText>{record.params.tweet}</CardText>
                    <ButtonBar>
                      <Left>
                        <Delete onClick={() => deleteUser(record?.params.id)}>Delete</Delete>
                      </Left>
                      <Right>
                        <Select>
                          <select defaultValue="default" onChange={e => changeSelect(record?.params.id, e)}>
                            <option value="default" disabled={true}>
                              Choose where to post
                            </option>
                            {columns &&
                              columns?.map((column, i) => (
                                <option key={i} value={column.params.slug}>
                                  {column.params.name}
                                </option>
                              ))}
                          </select>
                        </Select>
                        <Buttons>
                          <Post onClick={() => post(record?.params.id)}> Post </Post>
                          <Post onClick={() => showModal(record?.params.conversationId)}>Show threads</Post>
                        </Buttons>
                      </Right>
                    </ButtonBar>
                  </CardContent>
                </Card>
              ) : null
            )}
        </CardContainer>
      </Container>
    </Layout>
  )
}

export default ViewPostsComponent
