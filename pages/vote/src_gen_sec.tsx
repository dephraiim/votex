import { Button, Grid, Radio, Text } from "@geist-ui/core"
import { getSession, useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState } from "react"
import Layout from "../../components/layout"
import Candidate from "../../components/Candidate"
import { ArrowLeft, Check } from "@geist-ui/icons"
import { GetServerSideProps } from "next"
import prisma from "../../lib/prismaClient"
import { VoteCandidateProps } from "../../types/types"

export default function Page({ candidates, votes }: VoteCandidateProps) {
  const router = useRouter()
  const [vote, setVote] = useState<string | number>("")

  const { data, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/api/auth/signin")
    },
  })

  if (status === "loading") {
    return (
      <Layout>
        <div>Page Loading...</div>
      </Layout>
    )
  }

  async function handleVote() {
    try {
      const body = { candidateId: vote, portfolio: "SRC General Secretary" }
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      await router.push("/dashboard")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Layout>
      <form>
        <Grid marginBottom={2}>
          <Text h1 my={0}>
            SRC General Secretary
          </Text>
          {votes && <Text>You have already voted for this portfolio</Text>}
          {!votes && (
            <Radio.Group
              value={vote}
              onChange={(val) => {
                setVote(val)
                console.log(val)
              }}
            >
              {candidates.map(({ name, programme, id }) => {
                return (
                  <Radio value={id} key={id}>
                    <Candidate
                      name={name}
                      programme={programme}
                      imageSrc="/logo.jpg"
                    />
                  </Radio>
                )
              })}
            </Radio.Group>
          )}
        </Grid>

        <Button
          my={2}
          marginRight={1}
          auto
          icon={<ArrowLeft />}
          scale={1.2}
          onClick={() => router.push("/dashboard")}
        >
          Back
        </Button>
        {!votes && (
          <Button
            my={2}
            auto
            icon={<Check />}
            type="success"
            scale={1.2}
            onClick={handleVote}
          >
            Vote
          </Button>
        )}
      </form>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  const candidates = await prisma.candidate.findMany({
    where: { portfolio: { equals: "SRC Treasurer" } },
  })

  const votes = await prisma.vote.findMany({
    where: { User: { email: { equals: session?.user.email } } },
  })

  return {
    props: { candidates, votes },
  }
}
