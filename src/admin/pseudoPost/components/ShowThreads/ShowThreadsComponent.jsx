import axios from 'axios'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Select from 'react-select'
import { truncate } from 'lodash'
import {
  ModalContainer,
  Modal,
  ModalHeader,
  ModalContent,
  Name,
  Close,
  ThreadPost,
  TweetPosted,
  Save,
  ButtonContainer,
  Buttons,
  Delete,
  Edit,
  SelectContainer
} from './ShowThreadsStyles'

const ShowThreadsComponent = ({
  columns,
  handleClose,
  show,
  user,
  conversationId,
  baseUrl,
  replaceUrl,
  formatHtml,
  approved,
  deletePost,
  handleChange,
  post
}) => {
  const [threads, setThreads] = useState([])

  const edit = id => {
    const _threads = JSON.parse(JSON.stringify(threads))
    _threads.map(thread => {
      if (thread.id === id) {
        thread.edit = true
      }
    })
    setThreads(_threads)
  }

  const save = id => {
    const _threads = JSON.parse(JSON.stringify(threads))
    _threads.map(async thread => {
      if (thread.id === id) {
        thread.edit = false
        const formData = new FormData()
        formData.set('tweet', thread.params.tweet)
        await axios.post(`${baseUrl}/admin/api/resources/PseudoPost/records/${id}/edit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
    })
    setThreads(_threads)
  }

  const updateTweet = (id, e) => {
    const _threads = JSON.parse(JSON.stringify(threads))
    _threads.map(thread => {
      if (thread.id === id) {
        thread.params.tweet = e
      }
    })
    setThreads(_threads)
  }

  useEffect(
    () => {
      const getThreadForPost = async () => {
        if (!baseUrl) {
          return
        }
        const response = await axios.get(
          `${baseUrl}/admin/api/resources/PseudoPost/actions/list?filters.username=${
            user.username
          }&filters.conversationId=${conversationId}&direction=asc&sortBy=id`
        )
        setThreads(response.data.records)
      }

      getThreadForPost()
    },
    [baseUrl]
  )

  return (
    <ModalContainer>
      <Modal show={show}>
        <ModalHeader>
          <Name>{user.username}</Name>
          <Close onClick={handleClose}>Close</Close>
        </ModalHeader>
        <ModalContent>
          {threads &&
            threads.map((thread, key) =>
              thread.params.reply_to === null && !thread.params.retweet ? (
                <ThreadPost key={key}>
                  <TweetPosted
                    approved
                    contentEditable={thread?.edit}
                    maxLength={280}
                    onBlur={e => {
                      updateTweet(thread.params.id, e.currentTarget.textContent)
                    }}
                    type="text"
                    dangerouslySetInnerHTML={{ __html: formatHtml(replaceUrl(thread.params.tweet, thread.params)) }}
                    focus={thread?.edit}
                  />
                  {!approved ? (
                    <ButtonContainer>
                      {key === 0 ? (
                        <Buttons>
                          <SelectContainer>
                            <Select
                              classNamePrefix="react-select"
                              placeholder="Select column"
                              options={columns}
                              menuPortalTarget={document.body}
                              styles={{ menuPortal: base => ({ ...base, zIndex: 12 }) }}
                              onChange={e => {
                                handleChange(thread.params.id, e)
                              }}
                            />
                          </SelectContainer>
                          <Save width={'200px'} onClick={() => post(thread.params.id)}>
                            Post
                          </Save>
                        </Buttons>
                      ) : null}
                      <Buttons>
                        <Delete onClick={() => deletePost(thread.params.id)}>Delete</Delete>
                        {thread?.edit ? (
                          <Save onClick={() => save(thread.params.id)}>Save</Save>
                        ) : (
                          <Edit onClick={() => edit(thread.params.id)}>Edit</Edit>
                        )}
                      </Buttons>
                    </ButtonContainer>
                  ) : null}
                </ThreadPost>
              ) : null
            )}
        </ModalContent>
      </Modal>
    </ModalContainer>
  )
}

export default ShowThreadsComponent
