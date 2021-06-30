import { useRecords } from 'admin-bro'
import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  ApproveUser,
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
} from './viewPostsComponentStyles'

const ViewPostsComponent = props => {
  const { records } = useRecords(props.resource.id)
  const [columns, setColumns] = useState([])

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

  useEffect(() => {
    const getColumns = async () => {
      const response = await axios.get(`${props.action.custom.baseUrl}/admin/api/resources/Column/actions/list`)
      setColumns(response.data.records)
    }

    getColumns()
  }, [])

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
          <ApproveUser onClick={() => approveUser(records[0]?.params.username)}>Approve User</ApproveUser>
          {records &&
            records.map((record, key) => (
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
                      <Post onClick={() => post(record?.params.id)}> Post </Post>
                    </Right>
                  </ButtonBar>
                </CardContent>
              </Card>
            ))}
        </CardContainer>
      </Container>
    </Layout>
  )
}

export default ViewPostsComponent
