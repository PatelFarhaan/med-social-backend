import { useRecords } from 'admin-bro'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Select from 'react-select'
import moment from 'moment'

import styled from 'styled-components'
import {
  ApproveUser,
  UserApproved,
  Delete,
  Left,
  Right,
  Post,
  SelectDiv,
  ButtonBar,
  CardText,
  CardTitle,
  CardContent,
  CardImage,
  Card,
  CardContainer,
  Container,
  Layout,
  Buttons,
  MainContainer,
  PostsContainer,
  Posts,
  TabBar,
  Tab,
  TitleContainer,
  CardColumn,
  CreatedTime
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
  const [tabOne, setTabOne] = useState(true)
  const [tabTwo, setTabTwo] = useState(false)
  const [threadCountMap, setThreadCountMap] = useState({})
  const [approvedPosts, setApprovedPosts] = useState([])
  const location = useLocation()

  const deletePost = async id => {
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

  useEffect(() => {
    const getColumns = async () => {
      const response = await axios.get(`${props.action.custom.baseUrl}/admin/api/resources/Column/actions/list?perPage=500`)
      if (!response.data.records) {
        return
      }
      response.data.records.forEach(_record => {
        _record.value = _record.params.slug
        _record.label = _record.params.name
      })
      setColumns(response.data.records)
    }
    if (location.search.indexOf('approve=true') !== -1) {
      setNotApproved(true)
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
    [records, props.location]
  )

  useEffect(
    () => {
      const getThreadCount = async username => {
        if (!username) {
          return
        }
        const response = await axios.get(
          `${props.action.custom.baseUrl}/admin/api/resources/PseudoPost/actions/getThreadCount?username=${username}`
        )
        setThreadCountMap(response.data.meta.threadCountMap)
      }
      getThreadCount(user.username)
    },
    [user, records, props.location]
  )

  useEffect(
    () => {
      const getApprovedPosts = async username => {
        if (!username) {
          return
        }
        const response = await axios.get(
          `${props.action.custom.baseUrl}/admin/api/resources/PseudoPost/actions/getApprovedPosts?username=${username}`
        )
        setApprovedPosts(response.data.meta.approvedPosts)
      }
      getApprovedPosts(user.username)
    },
    [user, records, props.location]
  )

  const post = id => {
    /**
     * fetch record using id
     * get column and conversationId from the record
     * iff column is present hit api
     */
    if (!user?.active) {
      setModal(false)
      setNotApproved(true)
      return
    }
    records.forEach(async record => {
      if (record.params.id === id && record.params.column) {
        await axios.get(
          `${props.action.custom.baseUrl}/admin/api/resources/PseudoPost/records/${id}/approvePost?slug=${
            record.params.column
          }&conversationId=${record.params.conversationId}&username=${record.params.username}`
        )
        // eslint-disable-next-line no-undef
        window.location.reload(false)
      }
    })
  }

  const handleChange = (id, e) => {
    /**
     * fetch record using id
     * insert into record object; column
     */
    records.forEach(record => {
      if (record.params.id === id) {
        record.params.column = e.value
      }
    })
  }

  const replaceUrl = (tweet, params) => {
    /**
     * 1. Find N; N is the number of urls to be replaced
     * 2. If N === 0; return original tweet
     * 2. For Nth replacement, replace the substr with the url.n key from the params
     * 3. return processed tweet
     */

    const n = (tweet.match(/https:\/\/t.co/g) || []).length
    let refinedTweet = tweet
    if (!n) {
      return refinedTweet
    }
    let i = 0
    while (i < n) {
      const preString = 'https://t.co/'
      const searchString = ' '
      const preIndex = refinedTweet.indexOf(preString)
      const searchIndex = preIndex + refinedTweet.substring(preIndex).indexOf(searchString)
      if (preIndex > searchIndex) {
        refinedTweet = refinedTweet.replace(refinedTweet.substring(preIndex), !params[`urls.${i}`] ? params.thumbnail : params[`urls.${i}`])
      } else {
        refinedTweet = refinedTweet.replace(
          refinedTweet.substring(preIndex, searchIndex),
          !params[`urls.${i}`] ? params.thumbnail : params[`urls.${i}`]
        )
      }
      i += 1
    }
    return refinedTweet
  }

  const formatHtml = content => {
    const reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g
    return content.replace(reg, "<a href='$1$2' target='_blank' rel='noopener noreferrer'>$1$2</a>")
  }

  const switchTabs = tab => {
    if (tab === 1) {
      setTabOne(true)
      setTabTwo(false)
    }
    if (tab === 2) {
      setTabOne(false)
      setTabTwo(true)
    }
  }

  const isValid = record =>
    record?.params.id === record?.params.conversationId && record?.params.reply_to === null && !record?.params.retweet

  if (!threadCountMap && !user) {
    return <h2>Loading...</h2>
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
              replaceUrl={replaceUrl}
              formatHtml={formatHtml}
              deletePost={deletePost}
              approved={tabTwo}
              columns={columns}
              handleChange={handleChange}
              post={post}
            />
          ) : null}
          {notApproved ? (
            <NotApprovedComponent handleClose={hideNotApproved} isOpen={notApproved} user={user} baseUrl={props.action.custom.baseUrl} />
          ) : null}
          {user?.active ? (
            <UserApproved disabled>User Approved</UserApproved>
          ) : (
            <>
              <ApproveUser onClick={showNotApproved}>Approve User</ApproveUser>
            </>
          )}
          <MainContainer>
            <PostsContainer>
              <TabBar>
                <Tab disableTab={!tabOne} onClick={() => switchTabs(1)}>
                  Unapproved Posts
                </Tab>
                <Tab disableTab={!tabTwo} onClick={() => switchTabs(2)}>
                  Approved Posts
                </Tab>
              </TabBar>
              <Posts>
                {tabOne &&
                  records &&
                  // thread.params.reply_to?.length === 0 && !thread.params.retweet
                  records.map((record, key) =>
                    isValid(record) && !record?.params.PostId ? (
                      <Card key={key}>
                        {/* <CardImage src="https://picsum.photos/500/300/?image=10" /> */}
                        <CardContent>
                          <CardTitle>{record.params.username}</CardTitle>
                          <CreatedTime>{moment(record.params.createdAt).fromNow()}</CreatedTime>
                          <CardText dangerouslySetInnerHTML={{ __html: formatHtml(replaceUrl(record.params.tweet, record.params)) }} />
                          <ButtonBar>
                            <Left>
                              <Delete onClick={() => deletePost(record?.params.id)}>Delete</Delete>
                            </Left>
                            <Right>
                              <SelectDiv>
                                <Select
                                  classNamePrefix="react-select"
                                  placeholder="Select column"
                                  options={columns}
                                  menuPortalTarget={document.body}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 9 }) }}
                                  onChange={e => {
                                    handleChange(record?.params.id, e)
                                  }}
                                />
                              </SelectDiv>
                              <Buttons>
                                <Post onClick={() => post(record?.params.id)}> Post </Post>
                                {threadCountMap[record?.params.conversationId.toString()] === 1 ? (
                                  <Post thread={false} onClick={() => showModal(record?.params.conversationId)}>
                                    Show Post
                                  </Post>
                                ) : (
                                  <Post thread={true} onClick={() => showModal(record?.params.conversationId)}>
                                    Show Thread
                                  </Post>
                                )}
                              </Buttons>
                            </Right>
                          </ButtonBar>
                        </CardContent>
                      </Card>
                    ) : null
                  )}
                {tabTwo &&
                  approvedPosts &&
                  approvedPosts.map((record, key) => (
                    <Card key={key}>
                      <CardContent>
                        <TitleContainer>
                          <CardTitle>{record.params.username}</CardTitle>
                          <CardColumn>Posted to: {record.params.name}</CardColumn>
                        </TitleContainer>
                        <CreatedTime>{moment(record.params.created_at).fromNow()}</CreatedTime>
                        <CardText dangerouslySetInnerHTML={{ __html: formatHtml(replaceUrl(record.params.tweet, record.params)) }} />
                        <ButtonBar>
                          {threadCountMap[(record?.params.conversationId)] === 1 ? (
                            <Post thread={false} onClick={() => showModal(record?.params.conversationId)}>
                              Show Post
                            </Post>
                          ) : (
                            <Post thread={true} onClick={() => showModal(record?.params.conversationId)}>
                              Show Thread
                            </Post>
                          )}
                        </ButtonBar>
                      </CardContent>
                    </Card>
                  ))}
              </Posts>
            </PostsContainer>
          </MainContainer>
        </CardContainer>
      </Container>
    </Layout>
  )
}

export default ViewPostsComponent
