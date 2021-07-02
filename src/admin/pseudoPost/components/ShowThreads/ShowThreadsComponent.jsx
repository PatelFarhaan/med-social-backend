import axios from 'axios'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ModalContainer, Modal, ModalHeader, ModalContent, Name, Close, ThreadPost, Tweet, Save } from './ShowThreadsStyles'

const ShowThreadsComponent = ({ handleClose, show, user, conversationId, baseUrl }) => {
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
        const response = await axios.post(`${baseUrl}/admin/api/resources/PseudoPost/records/${id}/edit`, formData, {
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
        thread.params.tweet = e.target.value
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
          }&filters.conversationId=${conversationId}`
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
            threads.map((thread, key) => (
              <ThreadPost key={key}>
                <Tweet
                  showCount
                  maxLength={280}
                  onChange={e => updateTweet(thread.params.id, e)}
                  disabled={!thread?.edit}
                  type="text"
                  defaultValue={thread.params.tweet}
                  focus={thread?.edit}
                />
                {thread?.edit ? (
                  <Save onClick={() => save(thread.params.id)}>Save</Save>
                ) : (
                  <Save onClick={() => edit(thread.params.id)}>Edit</Save>
                )}
              </ThreadPost>
            ))}
        </ModalContent>
      </Modal>
    </ModalContainer>
  )
}

export default ShowThreadsComponent
